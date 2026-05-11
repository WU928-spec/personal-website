-- ============================================================
-- Supabase 记忆碎片（Moments）表结构
-- 在 Supabase SQL Editor → New query 中执行以下语句
-- ============================================================

-- 1. 创建 moments 表
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

-- 2. 启用行级安全（RLS）
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

-- 3. 公开访问策略（由前端登录状态控制权限）
CREATE POLICY "Allow public select" ON moments
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON moments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON moments
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON moments
  FOR DELETE USING (true);

-- 4. 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at DESC);
