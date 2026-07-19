package main

import (
	"context"
	"log"
	"net/http"
)

func main() {
	cfg := loadConfig()
	ctx := context.Background()

	db, err := newDB(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("could not connect to database: %v", err)
	}

	server := &Server{
		db:      db,
		sidecar: newSidecarClient(cfg.SidecarURL),
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /search", server.handleSearch)
	mux.HandleFunc("GET /fonts/{id}", server.handleGetFont)
	mux.HandleFunc("GET /fonts/{id}/neighbors", server.handleNeighbors)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	log.Printf("listening on :%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, withCORS(mux)))
}
