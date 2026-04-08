-- ============================================================
-- DormSy Database Schema v1.0
-- Run this in the Supabase SQL Editor in order.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. COLLEGES
-- ============================================================
CREATE TABLE colleges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email_domain  TEXT NOT NULL UNIQUE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: Luther College (the only active college at launch)
INSERT INTO colleges (name, email_domain, is_active)
VALUES ('Luther College', 'luther.edu', true);

-- ============================================================
-- 2. WAITLIST
-- ============================================================
CREATE TABLE waitlist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  college_name  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. USERS
-- Note: id matches the Supabase Auth user ID.
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY, -- matches auth.users.id
  college_id    UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
  username      TEXT UNIQUE,      -- nullable until profile setup complete
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  avatar_url    TEXT,
  phone         TEXT,
  instagram     TEXT,
  notify_messages  BOOLEAN NOT NULL DEFAULT true,
  notify_expiry    BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_college_id ON users(college_id);
CREATE INDEX idx_users_username ON users(username);

-- ============================================================
-- 4. LISTINGS
-- ============================================================
CREATE TYPE listing_category AS ENUM (
  'textbooks', 'electronics', 'furniture', 'clothes', 'other'
);

CREATE TYPE listing_condition AS ENUM (
  'new', 'like_new', 'good', 'used'
);

CREATE TYPE listing_status AS ENUM (
  'active', 'sold', 'archived', 'deleted'
);

CREATE TABLE listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  college_id    UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
  title         TEXT NOT NULL CHECK (char_length(title) <= 60),
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT CHECK (char_length(description) <= 300),
  price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category      listing_category NOT NULL,
  condition     listing_condition NOT NULL,
  status        listing_status NOT NULL DEFAULT 'active',
  views_count   INTEGER NOT NULL DEFAULT 0,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast feed queries
CREATE INDEX idx_listings_college_status_created ON listings(college_id, status, created_at DESC);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_expires_at ON listings(expires_at) WHERE status = 'active';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. LISTING PHOTOS
-- ============================================================
CREATE TABLE listing_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_url   TEXT NOT NULL,
  order_index   INTEGER NOT NULL CHECK (order_index BETWEEN 0 AND 2)
);

CREATE INDEX idx_listing_photos_listing_id ON listing_photos(listing_id);

-- ============================================================
-- 6. SAVED LISTINGS
-- ============================================================
CREATE TABLE saved_listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_saved_listings_user_id ON saved_listings(user_id);

-- ============================================================
-- 7. MESSAGES
-- ============================================================
CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  sender_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_messages_listing_id ON messages(listing_id);
CREATE INDEX idx_messages_receiver_unread ON messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX idx_messages_conversation ON messages(listing_id, sender_id, receiver_id, created_at);

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- The backend uses the service role key which bypasses RLS.
-- RLS below protects direct Supabase client access (e.g. Realtime).
-- ============================================================

ALTER TABLE colleges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist       ENABLE ROW LEVEL SECURITY;
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;

-- colleges: anyone can read active colleges (for landing page)
CREATE POLICY "colleges_public_read" ON colleges
  FOR SELECT USING (is_active = true);

-- waitlist: anyone can insert (for unsupported colleges)
CREATE POLICY "waitlist_insert" ON waitlist
  FOR INSERT WITH CHECK (true);

-- users: authenticated users can read users in the same college
CREATE POLICY "users_read_same_college" ON users
  FOR SELECT USING (
    college_id = (
      SELECT college_id FROM users WHERE id = auth.uid()
    )
  );

-- users: users can update only their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- listings: authenticated users can read active listings in their college
CREATE POLICY "listings_read_own_college" ON listings
  FOR SELECT USING (
    status != 'deleted' AND
    college_id = (
      SELECT college_id FROM users WHERE id = auth.uid()
    )
  );

-- listings: sellers can manage their own listings
CREATE POLICY "listings_insert_own" ON listings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "listings_update_own" ON listings
  FOR UPDATE USING (user_id = auth.uid());

-- listing_photos: follow parent listing access
CREATE POLICY "listing_photos_read" ON listing_photos
  FOR SELECT USING (
    listing_id IN (
      SELECT id FROM listings
      WHERE status != 'deleted'
      AND college_id = (SELECT college_id FROM users WHERE id = auth.uid())
    )
  );

-- saved_listings: users manage their own saves
CREATE POLICY "saved_listings_own" ON saved_listings
  FOR ALL USING (user_id = auth.uid());

-- messages: users can read their own messages (for Realtime)
CREATE POLICY "messages_read_own" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

-- messages: users can insert messages (backend validates college boundary)
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- 9. REALTIME
-- Enable Realtime on the messages table for live chat.
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- Done. Your schema is ready.
-- ============================================================
