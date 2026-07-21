package main

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	SidecarURL  string
	Port        string
	// Minimum cosine similarity a query's nearest font must clear to return results.
	MinTextSearchConfidence float64
	GoogleClientID          string
}

func loadConfig() Config {
	if err := godotenv.Load(".env"); err != nil {
		_ = godotenv.Load("../.env")
	}

	return Config{
		DatabaseURL:             mustEnv("DATABASE_URL"),
		SidecarURL:              envOrDefault("SIDECAR_URL", "http://127.0.0.1:8001"),
		Port:                    envOrDefault("PORT", "8080"),
		MinTextSearchConfidence: envFloatOrDefault("MIN_TEXT_SEARCH_CONFIDENCE", 0.15),
		GoogleClientID:          mustEnv("GOOGLE_CLIENT_ID"),
	}
}

func mustEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("%s is required", key)
	}
	return value
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func envFloatOrDefault(key string, fallback float64) float64 {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseFloat(value, 64); err == nil {
			return parsed
		}
	}
	return fallback
}
