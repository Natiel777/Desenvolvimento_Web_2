const BASE_URL = "http://localhost:3000";

async function registerUser() {
  const email = document.getElementById('emailRegister').value;
  const senha = document.getElementById('senhaRegister').value;
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, senha }),
    credentials: 'include'
  });
  const data = await res.json();
  alert(data.mensagem || data.erro);
}

async function loginUser() {
  const email = document.getElementById('emailLogin').value;
  const senha = document.getElementById('senhaLogin').value;
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, senha }),
    credentials: 'include'
  });
  const data = await res.json();
  alert(res.ok ? 'Login efetuado!' : data.erro);
}

async function logoutUser() {
  await fetch(`${BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
  alert('Logout realizado.');
}

async function getProfile() {
  const res = await fetch(`${BASE_URL}/perfil`, { credentials: 'include' });
  if (res.ok) {
    const { usuario } = await res.json();
    document.getElementById('profileInfo').innerText =
      `ID: ${usuario.id} | Email: ${usuario.email} | Papel: ${usuario.papel}`;
  } else {
    document.getElementById('profileInfo').innerText = 'Não autenticado.';
  }
}

// ——— Funções CRUD de filmes ———

async function criarFilme() {
  const titulo = document.getElementById('postTitulo').value;
  const genero = document.getElementById('postGenero').value;
  const nota   = parseFloat(document.getElementById('postNota').value);
  const res = await fetch(`${BASE_URL}/filmes`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ titulo, genero, nota }),
    credentials: 'include'
  });
  console.log(await res.json());
}

async function atualizarFilme() {
  const id     = document.getElementById('putId').value;
  const titulo = document.getElementById('putTitulo').value;
  const genero = document.getElementById('putGenero').value;
  const nota   = parseFloat(document.getElementById('putNota').value);
  const res = await fetch(`${BASE_URL}/filmes/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ titulo, genero, nota }),
    credentials: 'include'
  });
  console.log(await res.json());
}

async function removerFilme() {
  const id = document.getElementById('deleteId').value;
  await fetch(`${BASE_URL}/filmes/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  alert('Filme/Série removido com sucesso!');
}

async function mostrarFilmes() {
  const res = await fetch(`${BASE_URL}/filmes`, { credentials: 'include' });
  const data = await res.json();
  let html = '<ul>';
  data.forEach(f => {
    html += `<li>${f.id}: ${f.titulo} (${f.genero}) – Nota: ${f.nota}</li>`;
  });
  html += '</ul>';
  document.getElementById('filmesLista').innerHTML = html;
}

async function buscarFilmePorId() {
  const id = document.getElementById('getId').value;
  if (!id) return alert('Insira um ID válido');
  const res = await fetch(`${BASE_URL}/filmes/${id}`, { credentials: 'include' });
  if (!res.ok) {
    document.getElementById('filmeEncontrado').innerHTML =
      '<p style="color:red;">Filme não encontrado.</p>';
    return;
  }
  const f = await res.json();
  document.getElementById('filmeEncontrado').innerHTML = `
    <p><strong>ID:</strong> ${f.id}</p>
    <p><strong>Título:</strong> ${f.titulo}</p>
    <p><strong>Gênero:</strong> ${f.genero}</p>
    <p><strong>Nota:</strong> ${f.nota}</p>
  `;
}
