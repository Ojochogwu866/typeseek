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

func (d *DB) SearchByVector(ctx context.Context, vec []float32, limit int) ([]FontResult, error) {
	rows, err := d.pool.Query(ctx, `
		SELECT fonts.id, fonts.name, fonts.category, fonts.license, fonts.source_url,
		       1 - (embeddings.vec <=> $1) AS similarity
		FROM embeddings
		JOIN fonts ON fonts.id = embeddings.font_id
		ORDER BY embeddings.vec <=> $1
		LIMIT $2
	`, pgvector.NewVector(vec), limit)
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

// Neighbors finds the nearest fonts to the given font's own stored embedding —
// a pure vector lookup against the index, no embedding call involved.
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
