# UNIDADE 7 - Autenticação, Autorização e Sessões

## Sobre o Projeto

Este projeto é um **CRUD de filmes/séries** com autenticação de usuários. A aplicação foi desenvolvida com Node.js/Express no backend e HTML/CSS/JavaScript no frontend, utilizando SQLite para persistência de dados.

**Principais recursos:**

- Cadastro de usuário (rota `POST /register`)
- Login de usuário (rota `POST /login`)
- Logout de usuário (rota `POST /logout`)
- Gerenciamento de sessão com cookies (express-session)
- Proteção de rotas: somente usuários autenticados podem criar, ler, atualizar e deletar filmes/séries
- Validação e tratamento de erros com mensagens de sucesso/erro no frontend

---

## Funcionalidades

| Recurso                   | Rota                 | Permissão   |
| ------------------------- | -------------------- | ----------- |
| Cadastro de usuário       | `POST /register`     | Público     |
| Login de usuário          | `POST /login`        | Público     |
| Logout                    | `POST /logout`       | Autenticado |
| Criar filme/série         | `POST /filmes`       | Autenticado |
| Listar todos os filmes    | `GET /filmes`        | Autenticado |
| Buscar filme/série por ID | `GET /filmes/:id`    | Autenticado |
| Atualizar filme/série     | `PUT /filmes/:id`    | Autenticado |
| Deletar filme/série       | `DELETE /filmes/:id` | Autenticado |

---

## Tecnologias Utilizadas

- **Backend:** Node.js, Express, express-session, bcrypt, better-sqlite3
- **Banco de Dados:** SQLite (arquivo `filmes.db`)
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API)

---

## Estrutura do Projeto

```
UNIDADE-7/
├── backend/
│   ├── server.js          # Lógica do servidor e rotas
│   ├── package.json       # Dependências e scripts
│   └── filmes.db          # Banco SQLite
├── frontend/
│   ├── index.html         # Interface do usuário
│   ├── styles/
│   │   └── style.css      # Estilos
│   └── scripts/
│       └── app.js         # Lógica do frontend
└── README.md              # Documentação do projeto
```

---

## Como Rodar

### Pré-requisitos

- Node.js v16+ instalado
- NPM (ou Yarn)

### Instalação e Execução

1. Clone este repositório:
   ```bash
   git clone <URL-do-repositório>
   cd UNIDADE-7/backend
   ```
2. Instale as dependências do backend:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
   O backend ficará disponível em `http://localhost:3000`.
4. Abra o frontend:
   - Abra `frontend/index.html` diretamente no navegador, ou
   - Use extensão Live Server no VSCode para rodar em `http://127.0.0.1:5500`.

---

## Testando o Fluxo de Autenticação

1. **Cadastro:**

   - Acesse o formulário de cadastro no frontend ou via API:
     ```http
     POST /register
     Content-Type: application/json
     {
       "email": "usuario@exemplo.com",
       "senha": "suaSenha"
     }
     ```
   - Deve retornar **201** e dados do usuário sem a senha.

2. **Login:**

   - Realize login:
     ```http
     POST /login
     Content-Type: application/json
     {
       "email": "usuario@exemplo.com",
       "senha": "suaSenha"
     }
     ```
   - Deve retornar **200** com mensagem de sucesso e armazenar sessão.

3. **Rotas protegidas:**

   - Tente acessar `GET /filmes` sem estar logado: deve retornar **401 Não autenticado**.
   - Após o login, acesse `GET /filmes` novamente: deve listar filmes.

4. **Criação/Atualização/Deleção:**

   - Teste `POST /filmes`, `PUT /filmes/:id`, `DELETE /filmes/:id` e `GET /filmes/:id` para criar, editar, deletar e buscar filmes.

5. **Logout:**

   - Chame `POST /logout`: a sessão é destruída e não é mais possível acessar rotas protegidas.

---

## Segurança

- **Hash de senhas:** bcrypt com salt rounds = 10.
- **Sessões:** cookies HTTP-only, gerenciados por express-session.
- **Validação:** notas de filmes checadas entre 0 e 10.

---


