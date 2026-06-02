# TypingMind Self-Hosted Backend

Complete backend infrastructure for a fully self-hosted TypingMind instance. This stack provides file storage, TTS proxy, shared links, knowledge base (RAG), and all required API endpoints with zero external TypingMind infrastructure dependencies.

---

## Architecture

| Service | Purpose | Exposure |
|---------|---------|----------|
| **Caddy** | Reverse proxy, static file server, automatic SSL | Ports 80/443 |
| **API** | Node.js 20 backend (Fastify) | Internal only |
| **MySQL 8** | Core app data, blob metadata, shared content | Internal only |
| **PostgreSQL 15 + pgvector** | Knowledge Base / RAG with vector embeddings | Internal only |
| **MinIO** | S3-compatible blob storage for file uploads | Internal only |

---

## Prerequisites

- Linux server with Docker & Docker Compose installed
- A domain pointed at the server (for automatic SSL)
- Patched TypingMind static frontend placed in `./src/`

---

## Quick Start

### 1. Configure Environment

```bash
cp .env .env.local
nano .env.local
```

Edit `.env.local` with your real values:
- `DOMAIN` — your public domain
- `OPENAI_API_KEY` — required for TTS proxy and knowledge base embeddings
- `ELEVENLABS_API_KEY` — required for ElevenLabs voice list proxy
- All passwords — change defaults

### 2. Update Caddyfile Domain

```bash
sed -i 's/typingmind.yourdomain.com/your-real-domain.com/g' Caddyfile
```

### 3. Place Frontend

Place your patched TypingMind static export into `./src/` so that `src/index.html` exists.

### 4. Start Services

```bash
docker compose up -d --build
```

### 5. Initialize MinIO Bucket

```bash
./setup.sh
```

This creates the `typingmind` bucket and sets a public-read policy on the `blobs/` prefix.

---

## Verification

After deployment, verify the endpoints:

```bash
# Config file served at root
curl -s https://yourdomain.com/config.json | head -c 200

# Health check
curl -s https://yourdomain.com/api/health

# File upload test
curl -X POST https://yourdomain.com/api/hosted/blobs \
  -F "file=@test.txt" \
  -v

# TTS proxy test (requires OPENAI_API_KEY)
curl -X POST https://yourdomain.com/api/hosted/voice/openai \
  -H "Content-Type: application/json" \
  -d '{"model":"tts-1","input":"Hello world","voice":"alloy"}' \
  --output test.mp3

# Knowledge base query (requires OPENAI_API_KEY)
curl -X POST https://yourdomain.com/api/cloud/knowledge/query \
  -H "Content-Type: application/json" \
  -d '{"query":"sample question","topK":3}'
```

---

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/hosted/blobs` | POST | Upload file to MinIO |
| `/api/hosted/blobs/:blobID` | GET | Download/stream file |
| `/api/hosted/voice/openai` | POST | Proxy TTS to OpenAI |
| `/api/hosted-users/voice/voices` | GET | Proxy voices list to ElevenLabs |
| `/api/share` | POST | Create shared chat link |
| `/api/shared-links` | GET | List shared links |
| `/api/shared_characters` | POST | Share a character |
| `/api/shared_characters/:id` | GET | Get shared character |
| `/api/shared_plugins` | POST | Share a plugin |
| `/api/shared_plugins/:id` | GET | Get shared plugin |
| `/api/cloud/knowledge/query` | POST | RAG query with embeddings |
| `/api/cloud/knowledge/read` | POST | Read documents by IDs |
| `/api/cloud/knowledge/tags` | GET | List knowledge tags |
| `/api/hosted/dynamic-context-endpoint-test` | POST | Test external JSON endpoint |
| `/api/sync-v2/blobs/:blobID` | POST | Sync blob upload |

---

## Project Structure

```
.
├── api/
│   ├── server.js          # Fastify backend implementation
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── config/
│   └── config.json        # Critical frontend configuration
├── init/
│   ├── mysql/
│   │   └── 01_schema.sql  # MySQL schema
│   └── postgres/
│       └── 01_schema.sql  # PostgreSQL + pgvector schema
├── src/                   # Patched TypingMind static frontend
├── Caddyfile              # Reverse proxy & static file config
├── docker-compose.yml     # Orchestration
├── .env                   # Environment variables template
├── setup.sh               # MinIO bucket initialization
└── README.md              # This file
```

---

## Security Notes

- Only Caddy exposes ports 80/443. All database and storage services are on the internal Docker network.
- Change all default passwords in `.env` before deploying.
- No license verification, subscription billing, or cloud auth is implemented — these are bypassed in the patched frontend.
- You may add an `API_KEY` header check in `server.js` if you want basic API protection.

---

## Troubleshooting

**API container fails to start**
Check logs: `docker compose logs -f api`
Common causes: databases not ready (restart api container after mysql/postgres are healthy).

**MinIO bucket not found**
Run `./setup.sh` after first deploy. The bucket is created automatically on API startup as a fallback, but the policy must be set manually.

**CORS errors in browser**
Ensure the `DOMAIN` in `.env` matches the domain in `Caddyfile`, and that you're accessing the site via HTTPS (not HTTP) if using a real domain.

**Knowledge base query returns empty**
Requires `OPENAI_API_KEY` to generate query embeddings. Documents must also have embeddings stored; this API does not include an ingestion endpoint — add documents directly to PostgreSQL or extend the API with a document upload endpoint.
