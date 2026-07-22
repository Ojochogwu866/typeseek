package main

import (
	"encoding/hex"
	"testing"
)

func TestGenerateSessionToken(t *testing.T) {
	token, err := generateSessionToken()
	if err != nil {
		t.Fatalf("generateSessionToken() error = %v", err)
	}
	if len(token) != 64 {
		t.Errorf("token length = %d, want 64 (32 bytes hex-encoded)", len(token))
	}
	if _, err := hex.DecodeString(token); err != nil {
		t.Errorf("token is not valid hex: %v", err)
	}
}

func TestGenerateSessionToken_NoCollisions(t *testing.T) {
	seen := make(map[string]bool)
	for i := 0; i < 1000; i++ {
		token, err := generateSessionToken()
		if err != nil {
			t.Fatalf("generateSessionToken() error = %v", err)
		}
		if seen[token] {
			t.Fatalf("duplicate token generated: %s", token)
		}
		seen[token] = true
	}
}
