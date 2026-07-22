package main

type FontResult struct {
	ID         int64   `json:"id"`
	Name       string  `json:"name"`
	Category   string  `json:"category"`
	License    string  `json:"license"`
	SourceURL  string  `json:"source_url"`
	Similarity float64 `json:"similarity,omitempty"`
}

// RegionResult groups results for one detected lettering region; Thumbnail is only shown for secondary (non-primary) regions.
type RegionResult struct {
	Results   []FontResult `json:"results"`
	Thumbnail string       `json:"thumbnail,omitempty"`
}
