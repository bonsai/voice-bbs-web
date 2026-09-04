-- categories
CREATE TABLE IF NOT EXISTS categories (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  color TEXT NOT NULL
);

INSERT OR IGNORE INTO categories (id, name, color) VALUES
('want',    'こんなのほしい', '#ec4899'),
('search',  '探してる',       '#8b5cf6'),
('trouble', '困ってる',       '#ef4444'),
('motetai', 'モテたい',       '#f59e0b');

-- threads
CREATE TABLE IF NOT EXISTS threads (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  category_id TEXT NOT NULL REFERENCES categories(id),
  title       TEXT,
  device_id   TEXT NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- posts
CREATE TABLE IF NOT EXISTS posts (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  thread_id   TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  device_id   TEXT NOT NULL,
  audio_url   TEXT NOT NULL,
  duration    REAL NOT NULL,
  content     TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_posts_thread  ON posts(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_threads_cat   ON threads(category_id, created_at);
CREATE INDEX IF NOT EXISTS idx_posts_device  ON posts(device_id, created_at);

-- full-text search
CREATE TABLE IF NOT EXISTS search_index (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id  TEXT,
  post_id    TEXT,
  content    TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE VIRTUAL TABLE IF NOT EXISTS search_index_fts USING fts5(
  content,
  content_rowid=id,
  content=search_index
);

CREATE TRIGGER IF NOT EXISTS search_index_insert AFTER INSERT ON posts BEGIN
  INSERT INTO search_index(thread_id, post_id, content) VALUES (NEW.thread_id, NEW.id, COALESCE(NEW.content, ''));
END;

CREATE TRIGGER IF NOT EXISTS search_index_delete AFTER DELETE ON posts BEGIN
  DELETE FROM search_index WHERE post_id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS search_index_update AFTER UPDATE OF content ON posts BEGIN
  UPDATE search_index SET content = COALESCE(NEW.content, '') WHERE post_id = NEW.id;
END;
