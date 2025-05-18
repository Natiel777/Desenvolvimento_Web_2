let palavra = prompt("Digite uma palavra:");

console.log("Quantidade de caracteres:", palavra.length);

let palavraInvertida = palavra.split('').reverse().join('');

if (palavra.toLowerCase() === palavraInvertida.toLowerCase()) {
  console.log("A palavra é um palíndromo.");
} else {
  console.log("A palavra não é um palíndromo.");
}
