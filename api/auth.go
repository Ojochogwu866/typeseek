package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

const (
	sessionDuration     = 30 * 24 * time.Hour
	sessionCookieName   = "typeseek_session"
	minPasswordLength   = 8
	uniqueViolationCode = "23505"
)

var (
	emailPattern          = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	errInvalidCredentials = errors.New("invalid email or password")
)

type User struct {
	ID    int64  `json:"id"`
	Email string `json:"email"`
}

type authRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (d *DB) CreateUser(ctx context.Context, email, passwordHash string) (int64, error) {
	var id int64
	err := d.pool.QueryRow(ctx,
		"INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
		email, passwordHash,
	).Scan(&id)
	return id, err
}

func (d *DB) GetUserByEmail(ctx context.Context, email string) (id int64, passwordHash string, err error) {
	err = d.pool.QueryRow(ctx,
		"SELECT id, password_hash FROM users WHERE email = $1", email,
	).Scan(&id, &passwordHash)
	return id, passwordHash, err
}

func (d *DB) CreateSession(ctx context.Context, userID int64) (string, error) {
	token, err := generateSessionToken()
	if err != nil {
		return "", err
	}
	_, err = d.pool.Exec(ctx,
		"INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
		token, userID, time.Now().Add(sessionDuration),
	)
	return token, err
}

func (d *DB) GetUserBySession(ctx context.Context, token string) (*User, error) {
	var user User
	err := d.pool.QueryRow(ctx, `
		SELECT users.id, users.email
		FROM sessions
		JOIN users ON users.id = sessions.user_id
		WHERE sessions.token = $1 AND sessions.expires_at > now()
	`, token).Scan(&user.ID, &user.Email)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (d *DB) DeleteSession(ctx context.Context, token string) error {
	_, err := d.pool.Exec(ctx, "DELETE FROM sessions WHERE token = $1", token)
	return err
}

func generateSessionToken() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

func (s *Server) handleSignup(w http.ResponseWriter, r *http.Request) {
	var body authRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "could not parse request body")
		return
	}

	email := strings.TrimSpace(strings.ToLower(body.Email))
	if !emailPattern.MatchString(email) {
		writeError(w, http.StatusBadRequest, "invalid email address")
		return
	}
	if len(body.Password) < minPasswordLength {
		writeError(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("password hash failed: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create account")
		return
	}

	userID, err := s.db.CreateUser(r.Context(), email, string(hash))
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == uniqueViolationCode {
			writeError(w, http.StatusConflict, "an account with this email already exists")
			return
		}
		log.Printf("create user failed: %v", err)
		writeError(w, http.StatusInternalServerError, "could not create account")
		return
	}

	s.startSession(w, r, userID)
	writeJSON(w, http.StatusCreated, User{ID: userID, Email: email})
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var body authRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "could not parse request body")
		return
	}

	email := strings.TrimSpace(strings.ToLower(body.Email))
	userID, passwordHash, err := s.db.GetUserByEmail(r.Context(), email)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			log.Printf("login lookup failed: %v", err)
		}
		writeError(w, http.StatusUnauthorized, errInvalidCredentials.Error())
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(body.Password)) != nil {
		writeError(w, http.StatusUnauthorized, errInvalidCredentials.Error())
		return
	}

	s.startSession(w, r, userID)
	writeJSON(w, http.StatusOK, User{ID: userID, Email: email})
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(sessionCookieName); err == nil {
		_ = s.db.DeleteSession(r.Context(), cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	user := s.currentUser(r)
	if user == nil {
		writeError(w, http.StatusUnauthorized, "not signed in")
		return
	}
	writeJSON(w, http.StatusOK, user)
}

func (s *Server) startSession(w http.ResponseWriter, r *http.Request, userID int64) {
	token, err := s.db.CreateSession(r.Context(), userID)
	if err != nil {
		log.Printf("session creation failed: %v", err)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    token,
		Path:     "/",
		Expires:  time.Now().Add(sessionDuration),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   r.TLS != nil,
	})
}

func (s *Server) currentUser(r *http.Request) *User {
	cookie, err := r.Cookie(sessionCookieName)
	if err != nil {
		return nil
	}
	user, err := s.db.GetUserBySession(r.Context(), cookie.Value)
	if err != nil {
		return nil
	}
	return user
}
