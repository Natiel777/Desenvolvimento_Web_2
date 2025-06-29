const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

const db = new Database('filmes.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS filmes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    genero TEXT NOT NULL,
    nota   REAL NOT NULL CHECK(nota BETWEEN 0 AND 10)
  );
  CREATE TABLE IF NOT EXISTS usuarios (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    email  TEXT UNIQUE NOT NULL,
    senha  TEXT NOT NULL,
    papel  TEXT NOT NULL DEFAULT 'user'
  );
`);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(session({
  secret: 'seuSegredoAqui',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

app.post('/register', async (req, res) => {
  const { email, senha, papel } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }
  try {
    const hash = await bcrypt.hash(senha, 10);
    const stmt = db.prepare('INSERT INTO usuarios (email, senha, papel) VALUES (?, ?, ?)');
    const info = stmt.run(email, hash, papel || 'user');
    const user = db.prepare('SELECT id, email, papel FROM usuarios WHERE id = ?')
                    .get(info.lastInsertRowid);
    res.status(201).json({ mensagem: 'Usuário cadastrado.', user });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ erro: 'Email já cadastrado.' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }
  const match = await bcrypt.compare(senha, user.senha);
  if (!match) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }
  req.session.usuario = { id: user.id, email: user.email, papel: user.papel };
  res.json({ mensagem: 'Login bem‑sucedido.', usuario: req.session.usuario });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao sair.' });
    }
    res.clearCookie('connect.sid');
    res.json({ mensagem: 'Logout efetuado.' });
  });
});

function requireAuth(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  res.status(401).json({ erro: 'Não autenticado.' });
}

app.get('/perfil', requireAuth, (req, res) => {
  res.json({ usuario: req.session.usuario });
});

app.post('/filmes', requireAuth, (req, res) => {
  const { titulo, genero, nota } = req.body;
  if (typeof nota !== 'number' || nota < 0 || nota > 10) {
    return res.status(400).json({ erro: 'Nota deve estar entre 0 e 10.' });
  }
  const stmt = db.prepare('INSERT INTO filmes (titulo, genero, nota) VALUES (?, ?, ?)');
  const info = stmt.run(titulo, genero, nota);
  const novo = db.prepare('SELECT * FROM filmes WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(novo);
});

app.get('/filmes', requireAuth, (req, res) => {
  const filmes = db.prepare('SELECT * FROM filmes').all();
  res.json(filmes);
});

app.get('/filmes/:id', requireAuth, (req, res) => {
  const filme = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);
  filme
    ? res.json(filme)
    : res.status(404).json({ erro: 'Filme não encontrado.' });
});

app.put('/filmes/:id', requireAuth, (req, res) => {
  const { titulo, genero, nota } = req.body;
  if (nota !== undefined && (nota < 0 || nota > 10)) {
    return res.status(400).json({ erro: 'Nota deve estar entre 0 e 10.' });
  }
  const exist = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);
  if (!exist) {
    return res.status(404).json({ erro: 'Filme não encontrado.' });
  }
  db.prepare(`
    UPDATE filmes SET
      titulo = COALESCE(?, titulo),
      genero = COALESCE(?, genero),
      nota   = COALESCE(?, nota)
    WHERE id = ?
  `).run(titulo, genero, nota, req.params.id);
  const updated = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);
  res.json(updated);
});

app.delete('/filmes/:id', requireAuth, (req, res) => {
  const del = db.prepare('DELETE FROM filmes WHERE id = ?').run(req.params.id);
  del.changes
    ? res.json({ mensagem: 'Filme removido.' })
    : res.status(404).json({ erro: 'Filme não encontrado.' });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
