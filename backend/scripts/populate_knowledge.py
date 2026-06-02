#!/usr/bin/env python3
"""
Populate NexumChat knowledge base with actual Legion infrastructure data.
Uses Ollama nomic-embed-text (768-dim) for embedding generation.
Targets the backend-postgres-1 container on the nexumchat-selfhosted_nexumchat network.
"""
import subprocess, json, os, uuid

OLLAMA_URL = "http://localhost:11435/api/embeddings"
EMBED_MODEL = "nomic-embed-text"

# --- Infrastructure Knowledge Documents ---
DOCUMENTS = [
    {
        "title": "Legion Docker Services Overview",
        "source": "docker-ps",
        "content": """Legion (100.106.121.100) runs these Docker services:
- backend (nexumchat-selfhosted): caddy:2-alpine (reverse proxy :8082→80), backend-api (Fastify :3000), mysql:8, pgvector/pgvector:pg15, minio/minio
- LibreChat: afewbits/librechat:latest (port 3080), rag_api, vectordb (pgvector), chat-mongodb, chat-meilisearch
- AI Stack: ollama/ollama (port 11435, models: romeofsDolphins 8B, claude-opus 8.2B, claude-sonnet 4B, claude-haiku 3.8B), qdrant/qdrant:v1.17 (port 6333)
- Infrastructure: cloudflare/cloudflared (tunnels), portainer/portainer-ce:2.39.1, caddy:2.11 (main reverse proxy :80/:443)
- Forgejo: codeberg.org/forgejo/forgejo:10 (port 3000)
- BionicGPT: bionicgpt-app (port 7703), asher-rag-engine-1, asher-doc-engine-1 (kreuzberg 4.1.2)
- RoleVault: rolevault-web (127.0.0.1:8002), rolevault-postgres (127.0.0.1:5434)
- UDD-web: udd-web:local (port 3000)
- Build: buildx_buildkit_udd-builder0"""
    },
    {
        "title": "NexumChat Backend Architecture",
        "source": "docker-compose",
        "content": """The NexumChat self-hosted backend consists of:
1. Caddy (caddy:2-alpine): Reverse proxy, serves static files from /var/www/nexumchat/src, reverse proxies /api/* to api:3000, /health to api:3000, /config.json served from /var/www/nexumchat/config
2. API (custom Fastify app): Node.js Fastify server on port 3000, handles: Ollama proxy at /api/ollama/*, file upload/blobs storage at /api/hosted/blobs, TTS at /api/hosted/voice/openai (now routed to local Hermes Voice), voice list at /api/hosted-users/voice/voices (local), shared links at /api/share, knowledge base RAG at /api/cloud/knowledge/query, /api/cloud/knowledge/read, /api/cloud/knowledge/tags using pgvector, dynamic context endpoint test at /api/hosted/dynamic-context-endpoint-test, sync at /api/sync-v2/blobs/:blobID
3. MySQL: Stores blobs metadata (id, original_name, mime_type, size_bytes, storage_key), shared_links, shared_characters, shared_plugins
4. PostgreSQL (pgvector/pgvector:pg15): Vector database storing knowledge_documents (id, title, content, metadata, embedding vector, source, created_at, updated_at), knowledge_tags, knowledge_document_tags
5. MinIO: Object storage for uploaded files in the 'nexumchat' bucket under blobs/ prefix
Network: nexumchat-selfhosted_nexumchat (bridge), shared with ollama container"""
    },
    {
        "title": "Ollama AI Models on Legion",
        "source": "ollama-list",
        "content": """Available Ollama models on Legion (port 11435, host port mapping):
- romeofsDolphins:latest (4.9 GB, llama family, 8.0B params, Q4_K_M quantization)
- claude-opus:latest (5.0 GB, qwen3 family, 8.2B params, Q4_K_M quantization)
- claude-sonnet:latest (2.5 GB, 4.0B params, Q4_K_M quantization)
- claude-haiku:latest (2.5 GB, 3.8B params, Q4_K_M quantization)
- nomic-embed-text:latest (274 MB, embedding model, 768-dim vectors)

Host endpoint: http://localhost:11435 (Docker mapped from container :11434)
Docker network: ai-stack_server_internal (172.20.0.x) and nexumchat-selfhosted_nexumchat (172.25.0.x)
The ollama container is on both networks so NexumChat API can reach it."""
    },
    {
        "title": "Network Architecture on Legion",
        "source": "docker-network-inspect",
        "content": """Legion Docker networks:
1. nexumchat-selfhosted_nexumchat (172.25.0.0/16): Contains backend services (caddy, api at 172.25.0.9, mysql, postgres, minio) and ollama at 172.25.0.8
2. ai-stack_server_internal (172.20.0.0/16): Contains ollama (172.20.0.9)
3. librechat_default (172.22.0.0/16): LibreChat, rag_api, vectordb, mongodb, meilisearch
4. rolevault_rolevault_internal (172.23.0.0/16): RoleVault backend services
5. Host-level services: rolevault-web (127.0.0.1:8002), rolevault-postgres (127.0.0.1:5434), backend-caddy (127.0.0.1:8082), ollama (127.0.0.1:11435)

Cross-network communication: Containers on different networks cannot reach each other directly. They must be on the same network or use host port mappings. NexumChat API reaches ollama via the shared nexumchat-selfhosted_nexumchat network."""
    },
    {
        "title": "Cloudflare Tunnels on Legion",
        "source": "cloudflared",
        "content": """Cloudflare tunnels running on Legion:
- nexumchat.asherlewis.online → localhost:8082 (NexumChat backend Caddy)
- agentshire.asherlewis.online → localhost:55210 (Agentshire town frontend)
- kimi.asherlewis.online → localhost:5494 (Kimi Code app)
- ai.asherlewis.online → localhost:3210 (unknown service)
- gitnexus.asherlewis.online → localhost:4747 (on Mac, not Legion)
The cloudflared container runs on the host network.
Main reverse proxy: Caddy on ports 80/443 (100.106.121.100) handles routing."""
    },
    {
        "title": "Hermes Voice Service",
        "source": "hermes-voice-main",
        "content": """Hermes Voice is a local TTS/STT service running on Legion at port 8000.
Built with: FastAPI, Faster-Whisper (large-v3, CUDA, float16), Piper TTS (en_US-lessac-medium)
Endpoints:
- POST /speak (form: text=...) → returns audio/wav (Piper TTS)
- POST /transcribe (file upload: audio) → returns {"text": "..."} (Whisper STT)
Models stored in /home/asher/hermes-voice/models/
- Whisper: models/whisper/ (large-v3)
- Piper: models/piper/en_US-lessac-medium.onnx
Started with: uvicorn api.main:app --host 0.0.0.0 --port 8000
Used by NexumChat backend as TTS provider (replacing OpenAI TTS)."""
    },
    {
        "title": "Storage & Databases on Legion",
        "source": "docker-volumes",
        "content": """Persistent storage on Legion:
- NexumChat: mysql_data (MySQL 8), postgres_data (pgvector/pg15), minio_data (S3-compatible), caddy_data, caddy_config — all named volumes in nexumchat-selfhosted_nexumchat project
- LibreChat: MongoDB (chat-mongodb), Meilisearch, LibreChat config and data
- RoleVault: rolevault_postgres_data (PostgreSQL 16 on port 5434)
- Ollama: models and config in Docker volume
- Root docker-compose at /home/asher/docker-compose.yml manages Forgejo, Portainer, Caddy
Database credentials stored in .env files under respective project directories.
MinIO access: minio-nexumchat / change-me-minio-123 (default credentials)."""
    },
    {
        "title": "NexumChat Knowledge Base API",
        "source": "server-js-api",
        "content": """Knowledge Base RAG endpoints in the NexumChat backend:
1. POST /api/cloud/knowledge/query — Semantic search using pgvector cosine similarity
   Request: {"query": "search text", "topK": 5, "tags": ["optional", "filters"]}
   Response: {"results": [{"id", "title", "content", "score": 0.95}, ...]}
   Uses nomic-embed-text (768-dim) via local Ollama for embeddings
   
2. POST /api/cloud/knowledge/read — Retrieve documents by ID
   Request: {"documentIDs": ["id1", "id2"]}
   Response: [{"id", "title", "content", "metadata", "source", "createdAt", "updatedAt"}]

3. GET /api/cloud/knowledge/tags — List all tags
   Response: [{"id", "name", "color", "createdAt"}]

Table schema: knowledge_documents (id UUID, title text, content text, metadata jsonb, embedding vector(768), source text, created_at, updated_at)
Tags: knowledge_tags (id, name, color), knowledge_document_tags (document_id, tag_id)"""
    },
    {
        "title": "TTS and Voice Pipeline",
        "source": "server-js-reroute",
        "content": """Voice/TTS pipeline in NexumChat (post-reroute):
1. Client sends TTS request to /api/hosted/voice/openai with {"input": "text to speak", "voice": "alloy"}
2. Backend API forwards to Hermes Voice at http://host.docker.internal:8000/speak (from Docker container)
3. Hermes Voice generates audio using local Piper TTS (en_US-lessac-medium)
4. Response is returned as audio/mpeg (matching OpenAI TTS format for frontend compatibility)
5. Voice list at /api/hosted-users/voice/voices returns local voice catalog

Previous routing (removed): OpenAI TTS API (api.openai.com), ElevenLabs voices API (api.elevenlabs.io)
All voice processing is now local — no external API calls for TTS."""
    },
]

def get_embedding(text):
    """Get embedding vector from Ollama."""
    payload = {"model": EMBED_MODEL, "prompt": text}
    result = subprocess.run(
        ["curl", "-s", OLLAMA_URL, "-d", json.dumps(payload)],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"Ollama call failed: {result.stderr}")
    data = json.loads(result.stdout)
    if "error" in data:
        raise RuntimeError(f"Ollama error: {data['error']}")
    return data["embedding"]


def main():
    # Connect via docker exec to the postgres container on the nexumchat network
    for i, doc in enumerate(DOCUMENTS, 1):
        doc_id = str(uuid.uuid4())
        title = doc["title"]
        content = doc["content"]
        source = doc.get("source", "manual")
        metadata = json.dumps(doc.get("metadata", {}))

        print(f"[{i}/{len(DOCUMENTS)}] Embedding: {title}")
        embedding = get_embedding(content)
        embedding_str = f"[{','.join(map(str, embedding))}]"

        # Insert into postgres
        sql = f"""
        INSERT INTO knowledge_documents (id, title, content, metadata, source, embedding)
        VALUES ('{doc_id}', '{title.replace("'", "''")}', '{content.replace("'", "''")}', '{metadata}', '{source}', '{embedding_str}'::vector)
        ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding;
        """
        cmd = [
            "docker", "exec", "backend-postgres-1",
            "psql", "-U", "nexumchat", "-d", "nexumchat", "-c", sql
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  ERROR: {result.stderr}")
        else:
            print(f"  INSERTED: {doc_id}")

        # Add a generic tag
        tag_sql = f"""
        INSERT INTO knowledge_tags (id, name, color) 
        VALUES ('{uuid.uuid4()}', 'infrastructure', '#22c55e') 
        ON CONFLICT DO NOTHING;
        """
        subprocess.run(
            ["docker", "exec", "backend-postgres-1", "psql", "-U", "nexumchat", "-d", "nexumchat", "-c", tag_sql],
            capture_output=True, text=True
        )

    count = subprocess.run(
        ["docker", "exec", "backend-postgres-1", "psql", "-U", "nexumchat", "-d", "nexumchat", "-c", "SELECT count(*) FROM knowledge_documents"],
        capture_output=True, text=True
    )
    print(f"\nTotal documents in knowledge base: {count.stdout.strip().split()[-1]}")


if __name__ == "__main__":
    main()
