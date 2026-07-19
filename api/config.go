package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	SidecarURL  string
	Port        string
}

func loadConfig() Config {
	if err := godotenv.Load(".env"); err != nil {
		_ = godotenv.Load("../.env")
	}

	return Config{
		DatabaseURL: mustEnv("DATABASE_URL"),
		SidecarURL:  envOrDefault("SIDECAR_URL", "http://127.0.0.1:8001"),
		Port:        envOrDefault("PORT", "8080"),
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
