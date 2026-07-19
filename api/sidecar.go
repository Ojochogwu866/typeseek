package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

type SidecarClient struct {
	baseURL string
	http    *http.Client
}

func newSidecarClient(baseURL string) *SidecarClient {
	return &SidecarClient{
		baseURL: baseURL,
		http:    &http.Client{Timeout: 30 * time.Second},
	}
}

type embedResponse struct {
	Vector []float32 `json:"vector"`
}

func (c *SidecarClient) EmbedImage(filename string, data []byte) ([]float32, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, err
	}
	if _, err := part.Write(data); err != nil {
		return nil, err
	}
	if err := writer.Close(); err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, c.baseURL+"/embed-image", &body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	return c.doEmbed(req)
}

func (c *SidecarClient) EmbedText(text string) ([]float32, error) {
	payload, err := json.Marshal(map[string]string{"text": text})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, c.baseURL+"/embed-text", bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	return c.doEmbed(req)
}

func (c *SidecarClient) doEmbed(req *http.Request) ([]float32, error) {
	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("sidecar returned %d: %s", resp.StatusCode, body)
	}

	var parsed embedResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return nil, err
	}
	return parsed.Vector, nil
}
