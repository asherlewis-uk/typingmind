CREATE DATABASE IF NOT EXISTS nexumchat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexumchat;

-- Blob metadata (files uploaded by users)
CREATE TABLE blobs (
    id VARCHAR(64) PRIMARY KEY,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    storage_key VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Shared chat links
CREATE TABLE shared_links (
    id VARCHAR(64) PRIMARY KEY,
    type ENUM('chat', 'character', 'plugin') NOT NULL,
    data JSON NOT NULL,
    owner_id VARCHAR(255),
    delete_token VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    INDEX idx_type (type),
    INDEX idx_owner (owner_id)
) ENGINE=InnoDB;

-- Shared characters (AI agents)
CREATE TABLE shared_characters (
    id VARCHAR(64) PRIMARY KEY,
    character_data JSON NOT NULL,
    is_org_admin BOOLEAN DEFAULT FALSE,
    owner_id VARCHAR(255),
    delete_token VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_owner (owner_id)
) ENGINE=InnoDB;

-- Shared plugins
CREATE TABLE shared_plugins (
    id VARCHAR(64) PRIMARY KEY,
    plugin_data JSON NOT NULL,
    is_org_admin BOOLEAN DEFAULT FALSE,
    owner_id VARCHAR(255),
    delete_token VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_owner (owner_id)
) ENGINE=InnoDB;

-- Cloud sync sessions (optional)
CREATE TABLE sync_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    device_id VARCHAR(255),
    last_sync_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB;
