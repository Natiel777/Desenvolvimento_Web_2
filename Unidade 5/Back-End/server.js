const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

let filmes = [];
let idAtual = 1;

app.post('/filmes', (req, res) => {
    const { titulo, genero, nota } = req.body;

    if (typeof nota !== 'number' || nota < 0 || nota > 10) {
        return res.status(400).json({ erro: 'A nota deve estar entre 0 e 10.' });
    }

    const novoFilme = { id: idAtual++, titulo, genero, nota };
    filmes.push(novoFilme);
    res.status(201).json(novoFilme);
});

app.get('/filmes', (req, res) => {
    res.json(filmes);
});

app.get('/filmes/:id', (req, res) => {
    const filme = filmes.find(f => f.id === parseInt(req.params.id));
    filme ? res.json(filme) : res.status(404).json({ erro: 'Filme/Série não encontrado.' });
});

app.put('/filmes/:id', (req, res) => {
    const filme = filmes.find(f => f.id === parseInt(req.params.id));
    if (!filme) return res.status(404).json({ erro: 'Filme/Série não encontrado.' });

    const { titulo, genero, nota } = req.body;

    if (nota !== undefined && (typeof nota !== 'number' || nota < 0 || nota > 10)) {
        return res.status(400).json({ erro: 'A nota deve estar entre 0 e 10.' });
    }

    filme.titulo = titulo || filme.titulo;
    filme.genero = genero || filme.genero;
    filme.nota = nota !== undefined ? nota : filme.nota;

    res.json(filme);
});

app.delete('/filmes/:id', (req, res) => {
    filmes = filmes.filter(f => f.id !== parseInt(req.params.id));
    res.json({ mensagem: 'Filme/Série removido.' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
