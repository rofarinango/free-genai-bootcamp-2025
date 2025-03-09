CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    words_count INTEGER DEFAULT 0  -- Counter cache for the number of words in the group
); 