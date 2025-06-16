const API_URL = "http://localhost:3000/filmes";

function criarFilme() {
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            titulo: document.getElementById("postTitulo").value,
            genero: document.getElementById("postGenero").value,
            nota: parseFloat(document.getElementById("postNota").value)
        })
    })
    .then(response => response.json()).then(console.log)
    .catch(error => console.error("Erro ao criar filme:", error));
}

function atualizarFilme() {
    const id = document.getElementById("putId").value;
    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            titulo: document.getElementById("putTitulo").value,
            genero: document.getElementById("putGenero").value,
            nota: parseFloat(document.getElementById("putNota").value)
        })
    })
    .then(response => response.json()).then(console.log)
    .catch(error => console.error("Erro ao atualizar filme:", error));
}

function removerFilme() {
    const id = document.getElementById("deleteId").value;
    fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    })
    .then(() => alert("Filme/Série removido com sucesso!"))
    .catch(error => console.error("Erro ao remover filme:", error));
}

function mostrarFilmes() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            let lista = "<h4>Filmes/Séries Favoritos:</h4><ul>";
            data.forEach(filme => {
                lista += `<li>ID: ${filme.id} - Título: ${filme.titulo} - Gênero: ${filme.genero} - Nota: ${filme.nota}</li>`;
            });
            lista += "</ul>";
            document.getElementById("filmesLista").innerHTML = lista;
        })
        .catch(error => console.error("Erro ao buscar filmes:", error));
}

function buscarFilmePorId() {
    const id = document.getElementById("getId").value;

    if (!id) {
        alert("Por favor, insira um ID válido.");
        return;
    }

    fetch(`${API_URL}/${id}`)
        .then(res => {
            if (!res.ok) throw new Error("Filme não encontrado.");
            return res.json();
        })
        .then(filme => {
            const resultado = `
                <p><strong>ID:</strong> ${filme.id}</p>
                <p><strong>Título:</strong> ${filme.titulo}</p>
                <p><strong>Gênero:</strong> ${filme.genero}</p>
                <p><strong>Nota:</strong> ${filme.nota}</p>
            `;
            document.getElementById("filmeEncontrado").innerHTML = resultado;
        })
        .catch(err => {
            document.getElementById("filmeEncontrado").innerHTML = `<p style="color:red;">${err.message}</p>`;
        });
}
