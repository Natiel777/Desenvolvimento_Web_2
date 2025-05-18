function calcular_IMC(peso, altura){
     return peso / (altura * altura);
}

function classificarIMC(imc) {
    if (imc < 18.5) {
        return "Abaixo do peso";
    } else if (imc >= 18.5 && imc < 24.9) {
        return "Peso normal"
    } else if (imc >= 25 && imc < 29.9) {
        return "Sobrepeso";
    } else {
        return "Obesidade";
    }
    }

console.log("- Cálculo do IMC -");
const peso = 70;
const altura = 1.80;
const imc = calcular_IMC(peso, altura);

console.log(`Peso: ${peso}`);
console.log(`Altura: ${altura}`);
console.log(`IMC: ${imc}`);
console.log(`Classificação: ${classificarIMC(imc)}`);
