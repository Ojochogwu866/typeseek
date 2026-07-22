package main

import (
	"os"
	"testing"
)

func TestEnvOrDefault(t *testing.T) {
	const key = "TYPESEEK_TEST_ENV_OR_DEFAULT"

	os.Unsetenv(key)
	if got := envOrDefault(key, "fallback"); got != "fallback" {
		t.Errorf("unset var: got %q, want %q", got, "fallback")
	}

	os.Setenv(key, "actual")
	defer os.Unsetenv(key)
	if got := envOrDefault(key, "fallback"); got != "actual" {
		t.Errorf("set var: got %q, want %q", got, "actual")
	}
}

func TestEnvFloatOrDefault(t *testing.T) {
	const key = "TYPESEEK_TEST_ENV_FLOAT"

	os.Unsetenv(key)
	if got := envFloatOrDefault(key, 0.15); got != 0.15 {
		t.Errorf("unset var: got %v, want %v", got, 0.15)
	}

	os.Setenv(key, "0.42")
	defer os.Unsetenv(key)
	if got := envFloatOrDefault(key, 0.15); got != 0.42 {
		t.Errorf("valid float: got %v, want %v", got, 0.42)
	}

	os.Setenv(key, "not-a-number")
	if got := envFloatOrDefault(key, 0.15); got != 0.15 {
		t.Errorf("malformed value should fall back: got %v, want %v", got, 0.15)
	}
}
