const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// file upload - vulnerable: no file type/size checks
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// -- DB setup (SQLite)
const DB_FILE = path.join(__dirname, 'db', 'demo.db');
const initialSQL = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');

if (!fs.existsSync(DB_FILE)) {
  fs.mkdirSync(path.join(__dirname, 'db'), { recursive: true });
  const db = new sqlite3.Database(DB_FILE);
  db.exec(initialSQL, (err) => {
    if (err) console.error('DB init error', err);
    db.close();
  });
}

const db = new sqlite3.Database(DB_FILE);

// ------------ Vulnerable auth --------------
const API_TOKEN = process.env.API_TOKEN || 'super-secret-token';

function checkAuth(req, res, next) {
  const token = req.headers['x-api-token'] || req.query.token;
  if (token === API_TOKEN) return next();
  res.status(401).send('Unauthorized — provide x-api-token header or ?token=');
}

app.get('/', (req, res) => {
  db.all('SELECT id, name, comment FROM comments ORDER BY id DESC LIMIT 50', [], (err, rows) => {
    if (err) {
      return res.status(500).send('DB error: ' + err.message);
    }
    res.render('index', { comments: rows });
  });
});

app.post('/comment', (req, res) => {
  const { name = 'Anonymous', comment = '' } = req.body;
  db.run('INSERT INTO comments (name, comment) VALUES (?, ?)', [name, comment], function (err) {
    if (err) return res.status(500).send('Insert failed: ' + err.message);
    res.redirect('/');
  });
});

// Vulnerable search endpoint (SQL injection)
app.get('/search', (req, res) => {
  const q = req.query.q || '';
  const sql = `SELECT id, name, comment FROM comments WHERE comment LIKE '%${q}%' LIMIT 100;`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).send('DB error: ' + err.message);
    res.render('index', { comments: rows });
  });
});

app.get('/api/comments', checkAuth, (req, res) => {
  db.all('SELECT id, name, comment FROM comments ORDER BY id DESC LIMIT 100', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.send(`File uploaded to ${req.file.path} (original name: ${req.file.originalname})`);
});

app.get('/crash', (req, res) => {
  try {
    throw new Error('Demo crash — stack trace shown on purpose for learning');
  } catch (e) {
    res.status(500).send(`<pre>${e.stack}</pre>`);
  }
});

app.listen(port, () => {
  console.log(`Vulnerable app listening at http://0.0.0.0:${port}`);
});
