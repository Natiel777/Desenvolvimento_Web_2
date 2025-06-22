const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database('filmes.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS filmes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    genero TEXT NOT NULL,
    nota REAL NOT NULL CHECK(nota >= 0 AND nota <= 10)
  )
`);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// CREATE
app.post('/filmes', (req, res) => {
  const { titulo, genero, nota } = req.body;
  if (typeof nota !== 'number' || nota < 0 || nota > 10) {
    return res.status(400).json({ erro: 'A nota deve estar entre 0 e 10.' });
  }
  try {
    const stmt = db.prepare('INSERT INTO filmes (titulo, genero, nota) VALUES (?, ?, ?)');
    const info = stmt.run(titulo, genero, nota);
    const novoFilme = db.prepare('SELECT * FROM filmes WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(novoFilme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao inserir no banco.' });
  }
});

app.get('/filmes', (req, res) => {
  try {
    const filmes = db.prepare('SELECT * FROM filmes').all();
    res.json(filmes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar filmes.' });
  }
});

app.get('/filmes/:id', (req, res) => {
  try {
    const filme = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);
    filme
      ? res.json(filme)
      : res.status(404).json({ erro: 'Filme/Série não encontrado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar filme.' });
  }
});

app.put('/filmes/:id', (req, res) => {
  const { titulo, genero, nota } = req.body;
  if (nota !== undefined && (typeof nota !== 'number' || nota < 0 || nota > 10)) {
    return res.status(400).json({ erro: 'A nota deve estar entre 0 e 10.' });
  }
  try {
    const exist = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);
    if (!exist) return res.status(404).json({ erro: 'Filme/Série não encontrado.' });

    const update = db.prepare(
      `UPDATE filmes SET
         titulo = COALESCE(?, titulo),
         genero = COALESCE(?, genero),
         nota   = COALESCE(?, nota)
       WHERE id = ?`
    );
    update.run(titulo, genero, nota, req.params.id);

    const updated = db.prepare('SELECT * FROM filmes WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar filme.' });
  }
});

app.delete('/filmes/:id', (req, res) => {
  try {
    const del = db.prepare('DELETE FROM filmes WHERE id = ?').run(req.params.id);
    if (del.changes) res.json({ mensagem: 'Filme/Série removido.' });
    else res.status(404).json({ erro: 'Filme/Série não encontrado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover filme.' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
