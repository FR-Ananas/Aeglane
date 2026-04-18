-- ============================================================
-- Aeglane — Supabase schema
-- Exécuter dans l'éditeur SQL Supabase (une seule fois)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  avatar     TEXT,
  color      TEXT,
  is_admin   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  protected   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id),
  content    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DELETE events include all columns (needed for room_deleted Realtime event)
ALTER TABLE rooms REPLICA IDENTITY FULL;

-- Activer Supabase Realtime sur ces tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Salon #general protégé (seed)
INSERT INTO rooms (name, description, protected)
VALUES ('general', 'Le salon principal', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Pour promouvoir un compte en admin après inscription :
-- UPDATE users SET is_admin = TRUE WHERE username = 'votre_pseudo';
