// Quando clicar no botão, chama a função buscarCachorro
document.getElementById("buscarBtn").addEventListener("click", buscarCachorro);

// Função para buscar informações sobre a raça do cachorro
async function buscarCachorro() {
  // Pega o texto digitado no campo e transforma em minúsculo
  const nomeRaça = document.getElementById("input").value.toLowerCase();

  // Pega a área onde vai mostrar o resultado
  const resultadoDiv = document.getElementById("resultado");

  // Mostra mensagem de carregando
  resultadoDiv.textContent = "Carregando...";

  try {
    // Busca todas as raças na API
    const response = await fetch("https://api.thedogapi.com/v1/breeds");
    const data = await response.json();

    // Procura a raça que tem o nome parecido com o digitado
    const raça = data.find(r =>
      r.name.toLowerCase().includes(nomeRaça)
    );

    // Limpa o resultado anterior
    resultadoDiv.innerHTML = "";

    // Se não encontrar a raça, mostra mensagem de erro
    if (!raça) {
      const erro = document.createElement("p");
      erro.textContent = "Raça não encontrada.";
      resultadoDiv.appendChild(erro);
      return;
    }

    // Busca a imagem da raça
    const imageResp = await fetch(`https://api.thedogapi.com/v1/images/search?breed_id=${raça.id}`);
    const imageData = await imageResp.json();
    const imageUrl = imageData[0]?.url;

    // Mostra o nome da raça
    const titulo = document.createElement("h2");
    titulo.textContent = raça.name;
    resultadoDiv.appendChild(titulo);

    // Mostra a imagem da raça, se tiver
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = raça.name;
      resultadoDiv.appendChild(img);
    }

    // Mostra o temperamento
    const temperamento = document.createElement("p");
    temperamento.innerHTML = `<strong>Temperamento:</strong> ${raça.temperament || "N/A"}`;
    resultadoDiv.appendChild(temperamento);

    // Mostra a altura
    const altura = document.createElement("p");
    altura.innerHTML = `<strong>Altura:</strong> ${raça.height.metric} cm`;
    resultadoDiv.appendChild(altura);

    // Mostra o peso
    const peso = document.createElement("p");
    peso.innerHTML = `<strong>Peso:</strong> ${raça.weight.metric} kg`;
    resultadoDiv.appendChild(peso);

    // Mostra a expectativa de vida
    const vida = document.createElement("p");
    vida.innerHTML = `<strong>Expectativa de vida:</strong> ${raça.life_span}`;
    resultadoDiv.appendChild(vida);

  } catch (error) {
    // Se der erro, mostra mensagem
    console.error(error);
    resultadoDiv.textContent = "Erro ao buscar dados. Tente novamente mais tarde.";
  }
}
