// ===============================
// Importação dos Módulos
// ===============================
const express = require('express'); // Framework web para criar rotas e servidor
const session = require('express-session'); // Gerenciar sessões do usuário
const cors = require('cors'); // Permitir requisições entre diferentes origens (CORS)
const Database = require('better-sqlite3'); // Banco de dados SQLite com suporte síncrono
const bcrypt = require('bcrypt'); // Criptografia de senhas
const path = require('path'); // Manipulação de caminhos de arquivos

// ===============================
// Configurações Iniciais
// ===============================
const app = express(); // Inicializa o app Express
const port = 3000; // Porta do servidor
const db = new Database('banco.db'); // Instância do banco de dados SQLite

// ===============================
// Middlewares Globais
// ===============================

app.use(cors({
    origin: `http://localhost:${port}`, // Permitir acesso do frontend hospedado localmente
    credentials: true // Permitir envio de cookies com a requisição
}));

app.use(express.json()); // Permite ler JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Permite ler dados de formulários

// Sessão do usuário
app.use(session({
    secret: 'seu-segredo-super-secreto', // Chave secreta para assinar o cookie da sessão
    resave: false, // Não salvar a sessão se nada foi modificado
    saveUninitialized: false, // Não criar sessão sem dados
    cookie: {
        httpOnly: true, // Impede acesso ao cookie via JS no navegador
        maxAge: 24 * 60 * 60 * 1000 // Duração da sessão: 24 horas
    }
}));

// ===============================
// Middleware de Autenticação
// ===============================
const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Acesso não autorizado. Faça login.' });
    }
    next(); // Se autenticado, continua para a próxima função
};

// ===============================
// Inicialização do Banco de Dados
// ===============================
const initDb = () => {
    // Criação da tabela de usuários (se não existir)
    db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL
        )
    `);

    // Criação da tabela de lançamentos financeiros (se não existir)
    db.exec(`
        CREATE TABLE IF NOT EXISTS lancamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            valor REAL NOT NULL,
            categoria TEXT NOT NULL,
            descricao TEXT,
            data TEXT NOT NULL,
            usuario_id INTEGER,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
    `);

    console.log("Banco de dados inicializado com sucesso.");
};

// ===============================
// Rotas da API
// ===============================

// ---------- Cadastro ----------
app.post('/api/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;

    // Verifica se os campos obrigatórios foram preenchidos
    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Criptografa a senha
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(senha, salt);

    try {
        // Insere novo usuário no banco
        const stmt = db.prepare('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)');
        const info = stmt.run(nome, email, hash);

        // Cria sessão para o novo usuário
        req.session.userId = info.lastInsertRowid;

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: info.lastInsertRowid });
    } catch (error) {
        // Trata erro de e-mail já existente
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }

        res.status(500).json({ message: 'Erro ao cadastrar usuário.', error: error.message });
    }
});

// ---------- Login ----------
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    // Busca usuário pelo e-mail
    const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
    const user = stmt.get(email);

    // Verifica se usuário existe e se a senha confere
    if (!user || !bcrypt.compareSync(senha, user.senha)) {
        return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    // Cria a sessão do usuário
    req.session.userId = user.id;
    res.status(200).json({ message: 'Login bem-sucedido!' });
});

// ---------- Logout ----------
app.post('/api/logout', (req, res) => {
    // Destroi a sessão do usuário
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Não foi possível fazer logout.' });
        }

        res.clearCookie('connect.sid'); // Remove o cookie de sessão
        res.status(200).json({ message: 'Logout bem-sucedido.' });
    });
});

// ---------- Verificação de Sessão ----------
app.get('/api/session', (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ loggedIn: true, userId: req.session.userId });
    } else {
        res.status(200).json({ loggedIn: false });
    }
});

// ---------- Buscar Lançamentos ----------
app.get('/api/lancamentos', checkAuth, (req, res) => {
    const usuario_id = req.session.userId;
    const { tipo, periodo, categoria } = req.query;

    // Monta consulta com filtros dinâmicos
    let query = 'SELECT * FROM lancamentos WHERE usuario_id = ?';
    const params = [usuario_id];

    if (tipo) {
        query += ' AND tipo = ?';
        params.push(tipo);
    }
    if (periodo) {
        query += ' AND strftime("%Y-%m", data) = ?'; // Filtra por ano-mês
        params.push(periodo);
    }
    if (categoria) {
        query += ' AND categoria LIKE ?';
        params.push(`%${categoria}%`);
    }

    query += ' ORDER BY data DESC'; // Ordena por data decrescente

    try {
        const stmt = db.prepare(query);
        const lancamentos = stmt.all(params);
        res.status(200).json(lancamentos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar lançamentos.', error: error.message });
    }
});

// ---------- Criar Lançamento ----------
app.post('/api/lancamentos', checkAuth, (req, res) => {
    const { tipo, valor, categoria, descricao, data } = req.body;
    const usuario_id = req.session.userId;

    // Validação básica
    if (!tipo || !valor || !categoria || !data) {
        return res.status(400).json({ message: "Campos 'tipo', 'valor', 'categoria' e 'data' são obrigatórios." });
    }

    try {
        const stmt = db.prepare('INSERT INTO lancamentos (tipo, valor, categoria, descricao, data, usuario_id) VALUES (?, ?, ?, ?, ?, ?)');
        const info = stmt.run(tipo, valor, categoria, descricao, data, usuario_id);
        res.status(201).json({ message: 'Lançamento registrado com sucesso!', id: info.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar lançamento.', error: error.message });
    }
});

// ---------- Deletar Lançamento ----------
app.delete('/api/lancamentos/:id', checkAuth, (req, res) => {
    const { id } = req.params;
    const usuario_id = req.session.userId;

    try {
        // Verifica se o lançamento pertence ao usuário
        const stmtCheck = db.prepare('SELECT id FROM lancamentos WHERE id = ? AND usuario_id = ?');
        const lancamento = stmtCheck.get(id, usuario_id);

        if (!lancamento) {
            return res.status(403).json({ message: 'Ação não permitida.' });
        }

        // Deleta o lançamento
        const stmt = db.prepare('DELETE FROM lancamentos WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes > 0) {
            res.status(200).json({ message: 'Lançamento deletado com sucesso.' });
        } else {
            res.status(404).json({ message: 'Lançamento não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar lançamento.', error: error.message });
    }
});

// ===============================
// Rotas Estáticas e Inicialização
// ===============================

// Serve a página de cadastro.html ao acessar a raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'cadastro.html'));
});

// Permite acesso aos arquivos estáticos do frontend (JS, CSS, HTML)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Inicia o servidor e o banco de dados
app.listen(port, () => {
    initDb(); // Cria tabelas se não existirem
    console.log(`Servidor rodando em http://localhost:${port}`);
});
