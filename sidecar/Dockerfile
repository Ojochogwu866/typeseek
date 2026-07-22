# Build context is the repo root (this service imports ingestion.embed / ingestion.detect_regions).
FROM python:3.11-slim
WORKDIR /app

COPY pyproject.toml ./
COPY ingestion/ ./ingestion/
COPY sidecar/ ./sidecar/

# --extra-index-url (not --index-url) resolves torch as CPU-only while everything else still comes from PyPI, in one pass.
RUN pip install --no-cache-dir -e ".[embed,serve]" --extra-index-url https://download.pytorch.org/whl/cpu

EXPOSE 8001
CMD ["uvicorn", "sidecar.main:app", "--host", "0.0.0.0", "--port", "8001"]
