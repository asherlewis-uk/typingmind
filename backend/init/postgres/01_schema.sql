CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500),
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    source VARCHAR(255),
    owner_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_knowledge_embedding ON knowledge_documents USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE knowledge_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_document_tags (
    document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES knowledge_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);

CREATE INDEX idx_knowledge_owner ON knowledge_documents(owner_id);
CREATE INDEX idx_knowledge_source ON knowledge_documents(source);
