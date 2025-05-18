const carro = {
  marca: "Ford",
  modelo: "Fusion",
  ano: 2010,
  exibirInfo: function() {
    console.log(`Marca: ${this.marca} | Modelo: ${this.modelo} | Ano: ${this.ano}`);
  }
};

carro.exibirInfo();

carro.cor = "Preto";

carro.ano = 2025;

console.log(carro);
