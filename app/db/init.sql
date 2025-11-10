CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  comment TEXT
);

INSERT INTO comments (name, comment) VALUES ('admin', '<b>Welcome</b> — this is a demo comment.');
INSERT INTO comments (name, comment) VALUES ('attacker', '<script>alert("stored-xss");</script>');
