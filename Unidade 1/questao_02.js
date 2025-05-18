const numeros = [3, 7, 2, 9, 4];

const maior = Math.max(...numeros);
const menor = Math.min(...numeros);

const dobro = numeros.map(numero => numero * 2);

const maioresquecinco = numeros.filter(numero => numero > 5);

console.log("Array original:", numeros);
console.log("Maior valor:", maior);
console.log("Menor valor:", menor);
console.log("Array com o dobro dos valores:", dobro);
console.log("Números maiores que 5:", maioresquecinco);
