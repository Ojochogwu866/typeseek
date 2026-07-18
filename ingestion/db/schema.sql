-- Core schema for the font ingestion index.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS fonts (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    source      TEXT NOT NULL,
    source_url  TEXT NOT NULL,
    license     TEXT,
    category    TEXT,
    cluster_id  INTEGER,
    UNIQUE (source, name)
);

CREATE TABLE IF NOT EXISTS embeddings (
    font_id INTEGER PRIMARY KEY REFERENCES fonts (id) ON DELETE CASCADE,
    vec     vector(768) NOT NULL
);

CREATE INDEX IF NOT EXISTS embeddings_vec_hnsw
    ON embeddings USING hnsw (vec vector_cosine_ops);

CREATE TABLE IF NOT EXISTS descriptions (
    font_id      INTEGER PRIMARY KEY REFERENCES fonts (id) ON DELETE CASCADE,
    official_text TEXT,
    llm_tags     TEXT,
    tsv          tsvector
);

CREATE INDEX IF NOT EXISTS descriptions_tsv_idx
    ON descriptions USING gin (tsv);
