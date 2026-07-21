package main

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pgvector/pgvector-go"
	pgxvec "github.com/pgvector/pgvector-go/pgx"
)

type DB struct {
	pool *pgxpool.Pool
}

func newDB(ctx context.Context, databaseURL string) (*DB, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	config.AfterConnect = func(ctx context.Context, conn *pgx.Conn) error {
		return pgxvec.RegisterTypes(ctx, conn)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, err
	}
	return &DB{pool: pool}, nil
}

const fontColumns = "id, name, category, license, source_url"

// license is an exact-match filter; pass "" to skip it and match every license.
func (d *DB) SearchByVector(ctx context.Context, vec []float32, license string, limit int) ([]FontResult, error) {
	rows, err := d.pool.Query(ctx, `
		SELECT fonts.id, fonts.name, fonts.category, fonts.license, fonts.source_url,
		       1 - (embeddings.vec <=> $1) AS similarity
		FROM embeddings
		JOIN fonts ON fonts.id = embeddings.font_id
		WHERE $2 = '' OR fonts.license = $2
		ORDER BY embeddings.vec <=> $1
		LIMIT $3
	`, pgvector.NewVector(vec), license, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanFontResults(rows)
}

// TopVectorSimilarity returns the closest font's raw cosine similarity, used as a confidence gate.
func (d *DB) TopVectorSimilarity(ctx context.Context, vec []float32) (float64, error) {
	var similarity float64
	err := d.pool.QueryRow(ctx, `
		SELECT 1 - (embeddings.vec <=> $1)
		FROM embeddings
		ORDER BY embeddings.vec <=> $1
		LIMIT 1
	`, pgvector.NewVector(vec)).Scan(&similarity)
	if err != nil {
		return 0, err
	}
	return similarity, nil
}

// Hybrid vector+full-text RRF search; similarity normalizes against RRF's theoretical max, not this set's max, so weak matches don't read as 100%.
func (d *DB) SearchByText(ctx context.Context, vec []float32, query, license string, limit int) ([]FontResult, error) {
	rows, err := d.pool.Query(ctx, `
		WITH vector_results AS (
			SELECT fonts.id AS font_id, row_number() OVER (ORDER BY embeddings.vec <=> $1) AS rnk
			FROM embeddings
			JOIN fonts ON fonts.id = embeddings.font_id
			WHERE $4 = '' OR fonts.license = $4
			ORDER BY embeddings.vec <=> $1
			LIMIT $3
		),
		text_results AS (
			SELECT descriptions.font_id, row_number() OVER (ORDER BY ts_rank(descriptions.tsv, query) DESC) AS rnk
			FROM descriptions
			JOIN fonts ON fonts.id = descriptions.font_id
			CROSS JOIN plainto_tsquery('english', $2) AS query
			WHERE descriptions.tsv @@ query AND ($4 = '' OR fonts.license = $4)
			ORDER BY ts_rank(descriptions.tsv, query) DESC
			LIMIT $3
		),
		combined AS (
			SELECT
				coalesce(v.font_id, t.font_id) AS font_id,
				coalesce(1.0 / (60 + v.rnk), 0) + coalesce(1.0 / (60 + t.rnk), 0) AS score
			FROM vector_results v
			FULL OUTER JOIN text_results t ON v.font_id = t.font_id
		)
		SELECT fonts.id, fonts.name, fonts.category, fonts.license, fonts.source_url,
		       least(1.0, combined.score / (2.0 / 61)) AS similarity
		FROM combined
		JOIN fonts ON fonts.id = combined.font_id
		ORDER BY combined.score DESC
		LIMIT $3
	`, pgvector.NewVector(vec), query, limit, license)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanFontResults(rows)
}

func (d *DB) GetFont(ctx context.Context, id int64) (*FontResult, error) {
	var r FontResult
	err := d.pool.QueryRow(ctx, "SELECT "+fontColumns+" FROM fonts WHERE id = $1", id).
		Scan(&r.ID, &r.Name, &r.Category, &r.License, &r.SourceURL)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

// Neighbors finds nearest fonts via the font's own stored embedding — no query embedding needed.
func (d *DB) Neighbors(ctx context.Context, id int64, limit int) ([]FontResult, error) {
	rows, err := d.pool.Query(ctx, `
		SELECT f2.id, f2.name, f2.category, f2.license, f2.source_url,
		       1 - (e2.vec <=> e1.vec) AS similarity
		FROM embeddings e1
		JOIN embeddings e2 ON e2.font_id != e1.font_id
		JOIN fonts f2 ON f2.id = e2.font_id
		WHERE e1.font_id = $1
		ORDER BY e2.vec <=> e1.vec
		LIMIT $2
	`, id, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanFontResults(rows)
}

func scanFontResults(rows pgx.Rows) ([]FontResult, error) {
	results := []FontResult{}
	for rows.Next() {
		var r FontResult
		if err := rows.Scan(&r.ID, &r.Name, &r.Category, &r.License, &r.SourceURL, &r.Similarity); err != nil {
			return nil, err
		}
		results = append(results, r)
	}
	return results, rows.Err()
}
