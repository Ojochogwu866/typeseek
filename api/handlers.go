package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
)

const (
	defaultSearchLimit   = 30
	defaultNeighborLimit = 20
	maxUploadBytes       = 10 << 20 // 10MB
)

type Server struct {
	db      *DB
	sidecar *SidecarClient
}

func (s *Server) handleSearch(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadBytes)
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		writeError(w, http.StatusBadRequest, "could not parse upload")
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		writeError(w, http.StatusBadRequest, `missing "image" field`)
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not read upload")
		return
	}

	vector, err := s.sidecar.EmbedImage(header.Filename, data)
	if err != nil {
		log.Printf("sidecar embed failed: %v", err)
		writeError(w, http.StatusBadGateway, "embedding service unavailable")
		return
	}

	results, err := s.db.SearchByVector(r.Context(), vector, defaultSearchLimit)
	if err != nil {
		log.Printf("search query failed: %v", err)
		writeError(w, http.StatusInternalServerError, "search failed")
		return
	}

	writeJSON(w, http.StatusOK, results)
}

func (s *Server) handleGetFont(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid font id")
		return
	}

	font, err := s.db.GetFont(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "font not found")
		return
	}

	writeJSON(w, http.StatusOK, font)
}

func (s *Server) handleNeighbors(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid font id")
		return
	}

	results, err := s.db.Neighbors(r.Context(), id, defaultNeighborLimit)
	if err != nil {
		log.Printf("neighbors query failed: %v", err)
		writeError(w, http.StatusInternalServerError, "neighbors query failed")
		return
	}

	writeJSON(w, http.StatusOK, results)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("failed to encode response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
