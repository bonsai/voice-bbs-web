DROP TABLE IF EXISTS search_index_fts;

CREATE VIRTUAL TABLE search_index_fts USING fts5(
  content,
  content_rowid=id,
  content=search_index,
  tokenize='unicode61'
);

-- rebuild index from existing data
INSERT INTO search_index_fts(rowid, content) SELECT id, content FROM search_index;
