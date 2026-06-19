-- ============================================================
-- Supabase 全量数据上云 — 记忆碎片 + 日历 + 项目 + 站点设置
-- 在 Supabase SQL Editor → New query 中执行
-- ============================================================

-- ── 1. 记忆碎片（已完成）──
CREATE TABLE IF NOT EXISTS moments (
  id          TEXT PRIMARY KEY,
  author_id   TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  images      JSONB DEFAULT '[]'::JSONB,
  attachments JSONB DEFAULT '[]'::JSONB,
  location    TEXT,
  likes       JSONB DEFAULT '[]'::JSONB,
  comments    JSONB DEFAULT '[]'::JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON moments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON moments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON moments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON moments FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at DESC);

-- ── 2. 日历条目 ──
CREATE TABLE IF NOT EXISTS calendar_entries (
  date    TEXT PRIMARY KEY,
  todos   JSONB DEFAULT '[]'::JSONB,
  diary   TEXT DEFAULT ''
);

ALTER TABLE calendar_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON calendar_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON calendar_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON calendar_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON calendar_entries FOR DELETE USING (true);

-- ── 3. 项目列表 ──
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT,
  target_hours NUMERIC DEFAULT 0,
  status      TEXT DEFAULT 'active',
  parent_id   TEXT,
  summaries   JSONB DEFAULT '[]'::JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS summaries JSONB DEFAULT '[]'::JSONB;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON projects FOR DELETE USING (true);

-- ── 4. 站点设置（Hero / Skills / Footer / About 等）──
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON site_settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON site_settings FOR DELETE USING (true);

-- ── 5. Obsidian 笔记 ──
CREATE TABLE IF NOT EXISTS notes (
  path       TEXT PRIMARY KEY,
  content    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON notes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON notes FOR DELETE USING (true);

-- ── 6. 星空彩蛋记忆 ──
CREATE TABLE IF NOT EXISTS starry_memoirs (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL DEFAULT '',
  date        TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  brightness  NUMERIC DEFAULT 0.5,
  images      JSONB DEFAULT '[]'::JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE starry_memoirs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON starry_memoirs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON starry_memoirs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON starry_memoirs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON starry_memoirs FOR DELETE USING (true);

ALTER TABLE starry_memoirs ADD COLUMN IF NOT EXISTS x NUMERIC;
ALTER TABLE starry_memoirs ADD COLUMN IF NOT EXISTS y NUMERIC;
