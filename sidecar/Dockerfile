# Build context is the repo root (this service imports ingestion.embed / ingestion.detect_regions).
FROM python:3.11-slim
WORKDIR /app

# CPU-only wheels — the default PyPI torch build pulls in multi-GB CUDA deps that a
# CPU-only VPS will never use.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

COPY pyproject.toml ./
COPY ingestion/ ./ingestion/
COPY sidecar/ ./sidecar/
RUN pip install --no-cache-dir -e ".[embed,serve]"

EXPOSE 8001
CMD ["uvicorn", "sidecar.main:app", "--host", "0.0.0.0", "--port", "8001"]
