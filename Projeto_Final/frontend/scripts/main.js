// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost:3000/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
        if (body) {
            options.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(`${apiBaseUrl}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
            }
            // Retorna vazio para status 204 (No Content) como no DELETE
            if (response.status === 204 || response.status === 200 && response.headers.get('content-length') === '0') {
                return null;
            }
            // Retorna a resposta como JSON se houver corpo
            const text = await response.text();
            return text ? JSON.parse(text) : {};

        } catch (error) {
            console.error('Erro na API:', error);
            alert(error.message);
            throw error;
        }
        }

// --- LÓGICA DE CADASTRO ---
const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        try {
            await apiRequest('/cadastro', 'POST', { nome, email, senha });
            alert('Cadastro realizado com sucesso! Você será redirecionado para o dashboard.');
            window.location.href = '/index.html';
        } catch (error) {
        }
    });
    }

// --- LÓGICA DE LOGIN ---
const loginForm = document.getElementById('loginForm');
    if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        try {
            await apiRequest('/login', 'POST', { email, senha });
            alert('Login bem-sucedido!');
            window.location.href = '/index.html';
        } catch (error) {
        }
    });
    }

// --- LÓGICA DO DASHBOARD (INDEX.HTML) ---
    if (window.location.pathname.endsWith('index.html')) {
    let lancamentosCache = [];
    let myChart = null;

// Proteção de rota e carregamento inicial
(async function checkLoginAndLoadData() {
    try {
        const session = await apiRequest('/session');
        if (!session.loggedIn) {
            alert('Sessão expirada ou inválida. Por favor, faça o login novamente.');
            window.location.href = '/login.html'; // Redireciona para login
        } else {
            await carregarLancamentos();
        }
    } catch (error) {
        window.location.href = '/login.html';
    }
})();

// Carregar e renderizar lançamentos
async function carregarLancamentos() {
    const tipo = document.getElementById('filtro-tipo').value;
    const periodo = document.getElementById('filtro-periodo').value;
    const categoria = document.getElementById('filtro-categoria').value;
    
    let query = '/lancamentos?';
    if(tipo) query += `tipo=${tipo}&`;
    if(periodo) query += `periodo=${periodo}&`;
    if(categoria) query += `categoria=${categoria}&`;

    try {
        lancamentosCache = await apiRequest(query);
        renderizarTabela(lancamentosCache);
        atualizarResumo(lancamentosCache);
        atualizarGrafico(lancamentosCache);
    } catch (error) {
    }
}

// Renderizar tabela
function renderizarTabela(lancamentos) {
    const tbody = document.querySelector('#tabela-lancamentos tbody');
    tbody.innerHTML = '';
    lancamentos.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${l.tipo.charAt(0).toUpperCase() + l.tipo.slice(1)}</td>
            <td>R$ ${l.valor.toFixed(2).replace('.', ',')}</td>
            <td>${l.categoria}</td>
            <td>${l.descricao || '-'}</td>
            <td>${new Date(l.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
            <td class="actions">
                <button class="delete" data-id="${l.id}">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Atualizar Resumo
function atualizarResumo(lancamentos) {
    const totalEntradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((acc, l) => acc + l.valor, 0);
    const totalSaidas = lancamentos.filter(l => l.tipo === 'saida').reduce((acc, l) => acc + l.valor, 0);
    const saldo = totalEntradas - totalSaidas;

    document.getElementById('total-entradas').textContent = `Total Entradas: R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-saidas').textContent = `Total Saídas: R$ ${totalSaidas.toFixed(2).replace('.', ',')}`;
    document.getElementById('saldo-atual').textContent = `Saldo Atual: R$ ${saldo.toFixed(2).replace('.', ',')}`;
}

// Atualizar Gráfico
function atualizarGrafico(lancamentos) {
    // --- Gráfico de Pizza: ENTRADAS por Categoria ---
    const ctxEntradas = document.getElementById('grafico-entradas-categorias').getContext('2d');
    const entradas = lancamentos.filter(l => l.tipo === 'entrada');
    const dadosEntradas = entradas.reduce((acc, l) => {
    acc[l.categoria] = (acc[l.categoria] || 0) + l.valor;
    return acc;
    }, {});
    const labelsEntradas = Object.keys(dadosEntradas);
    const valoresEntradas = Object.values(dadosEntradas);

    if (window.graficoEntradasCategorias) window.graficoEntradasCategorias.destroy();
    window.graficoEntradasCategorias = new Chart(ctxEntradas, {
    type: 'pie',
    data: {
        labels: labelsEntradas,
        datasets: [{
            data: valoresEntradas,
            backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false }
        }
    }
    });

    // --- Gráfico de Pizza: SAÍDAS por Categoria ---
    const ctxSaidas = document.getElementById('grafico-categorias').getContext('2d');
    const saidas = lancamentos.filter(l => l.tipo === 'saida');
    const dadosSaidas = saidas.reduce((acc, l) => {
    acc[l.categoria] = (acc[l.categoria] || 0) + l.valor;
    return acc;
    }, {});
    const labelsSaidas = Object.keys(dadosSaidas);
    const valoresSaidas = Object.values(dadosSaidas);

    if (window.graficoCategorias) window.graficoCategorias.destroy();
    window.graficoCategorias = new Chart(ctxSaidas, {
    type: 'pie',
    data: {
        labels: labelsSaidas,
        datasets: [{
            data: valoresSaidas,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false }
        }
    }
    });

    // --- Gráfico de Barras: Totais por Dia ---
    const ctxPeriodo = document.getElementById('grafico-periodo').getContext('2d');
    const agrupadoPorData = lancamentos.reduce((acc, l) => {
    const dataFormatada = new Date(l.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    acc[dataFormatada] = (acc[dataFormatada] || 0) + l.valor;
    return acc;
    }, {});
    const labelsPeriodo = Object.keys(agrupadoPorData).sort((a, b) => {
    const [d1, m1, a1] = a.split('/'); const [d2, m2, a2] = b.split('/');
    return new Date(`${a1}-${m1}-${d1}`) - new Date(`${a2}-${m2}-${d2}`);
    });
    const valoresPeriodo = labelsPeriodo.map(label => agrupadoPorData[label]);

    if (window.graficoPeriodo) window.graficoPeriodo.destroy();
    window.graficoPeriodo = new Chart(ctxPeriodo, {
    type: 'bar',
    data: {
        labels: labelsPeriodo,
        datasets: [{
            label: 'Total por Dia',
            data: valoresPeriodo,
            backgroundColor: '#36A2EB'
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false }
        },
        scales: {
            x: { title: { display: true, text: 'Data' } },
            y: { title: { display: true, text: 'Total (R$)' } }
        }
    }
    });
    }


// --- Event Listeners do Dashboard ---

// Formulário de novo lançamento
document.getElementById('lancamentoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const lancamento = {
        tipo: document.getElementById('tipo').value,
        valor: parseFloat(document.getElementById('valor').value),
        categoria: document.getElementById('categoria').value,
        descricao: document.getElementById('descricao').value,
        data: document.getElementById('data').value,
    };
    try {
        await apiRequest('/lancamentos', 'POST', lancamento);
        document.getElementById('lancamentoForm').reset();
        await carregarLancamentos(); // Recarrega tudo
    } catch (error) {
    }
});

// Botão de Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await apiRequest('/logout', 'POST');
        alert('Você foi desconectado.');
        window.location.href = '/cadastro.html';
    } catch (error) {
    }
});

// Filtros
document.getElementById('filtro-tipo').addEventListener('change', carregarLancamentos);
document.getElementById('filtro-periodo').addEventListener('change', carregarLancamentos);
document.getElementById('filtro-categoria').addEventListener('input', carregarLancamentos);

// Deleção de lançamento (usando delegação de evento)
document.querySelector('#tabela-lancamentos tbody').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete')) {
        const id = e.target.getAttribute('data-id');
        if (confirm('Tem certeza que deseja excluir este lançamento?')) {
            try {
                await apiRequest(`/lancamentos/${id}`, 'DELETE');
                await carregarLancamentos(); 
            } catch (error) {
            }
        }
    }
});
}
});
