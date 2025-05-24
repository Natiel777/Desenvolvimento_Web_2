// Referência ao elemento de exibição (display) da calculadora
const display = document.getElementById('display');

// Variáveis para armazenar o número atual, o anterior e o operador selecionado
let numeroAtual = '';
let numeroAnterior = '';
let operador = null;

// Atualiza o conteúdo do display com o valor informado, ou mostra 0 se vazio
function atualizarDisplay(valor) {
  display.textContent = valor || '0';
}

// Limpa todos os valores e reseta a calculadora
function limpar() {
  numeroAtual = '';
  numeroAnterior = '';
  operador = null;
  atualizarDisplay('0');
}

// Insere números ou operadores no cálculo
function inserir(valor) {
  // Impede múltiplos pontos decimais
  if (valor === '.' && numeroAtual.includes('.')) return;

  // Se o valor for um operador (+, -, *, /)
  if ('+-*/'.includes(valor)) {
    // Impede iniciar com operador, exceto o "-"
    if (numeroAtual === '' && valor !== '-') return;

    // Permite trocar o operador se o número atual ainda não foi digitado
    if (operador !== null && numeroAtual === '') {
      operador = valor;
      return;
    }

    // Se já houver um número atual, armazena e prepara para o próximo
    if (numeroAtual !== '') {
      if (numeroAnterior !== '') calcular(); // Calcula se já existe operação anterior
      operador = valor;
      numeroAnterior = numeroAtual;
      numeroAtual = '';
      atualizarDisplay(valor);
      return;
    }
  }

  // Adiciona dígitos ou ponto ao número atual e atualiza o display
  numeroAtual += valor;
  atualizarDisplay(numeroAtual);
}

// Realiza o cálculo com os números e operador armazenados
function calcular() {
  // Verifica se todos os dados necessários estão disponíveis
  if (numeroAnterior === '' || numeroAtual === '' || operador === null) return;

  const num1 = parseFloat(numeroAnterior);
  const num2 = parseFloat(numeroAtual);

  let resultado;

  // Executa a operação de acordo com o operador
  switch (operador) {
    case '+':
      resultado = num1 + num2;
      break;
    case '-':
      resultado = num1 - num2;
      break;
    case '*':
      resultado = num1 * num2;
      break;
    case '/':
      resultado = num2 !== 0 ? num1 / num2 : 'Erro';
      break;
    default:
      return;
  }

  // Atualiza os valores após o cálculo
  numeroAtual = resultado.toString();
  operador = null;
  numeroAnterior = '';
  atualizarDisplay(numeroAtual); 
}
