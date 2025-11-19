// ===============================
// 🔐 LOGIN AUTOMÁTICO
// ===============================

// Aqui você coloca o email e a senha reais que existem no banco
const LOGIN_EMAIL = "email@exemplo.com";
const LOGIN_PASSWORD = "senha123";

// Esta função realiza o login no servidor e salva o token automaticamente
async function loginAutomatico() {
    console.log("Iniciando login automático...");

    try {
        // Faz a requisição POST para o backend
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: LOGIN_EMAIL,
                password: LOGIN_PASSWORD
            })
        });

        if (!response.ok) {
            throw new Error(`Falha no login. Status: ${response.status}`);
        }

        const data = await response.json();

        console.log("Token JWT recebido com sucesso:");
        console.log(data.token);

        localStorage.setItem("token", data.token);
        console.log("Token salvo no localStorage.");

        return true;

    } catch (error) {
        console.error("Erro durante o login automático:", error);
        return false;
    }
}

// ===============================
// 🎛 CAPTURA DOS SELECTS
// ===============================

const selectPeca1 = document.getElementById("peca1");
const selectPeca2 = document.getElementById("peca2");
const selectPeca3 = document.getElementById("peca3");
const botaoPedido = document.getElementById("buttonPedido");

function validar(nomeCampo, valor) {
    if (!valor || valor.trim() === "") {
        console.warn(`⚠️ O campo ${nomeCampo} não foi selecionado.`);
        return false;
    }
    return true;
}

// ===============================
// 🔢 FUNÇÃO PARA DEFINIR A ORDEM PELA PEÇA
// ===============================

function definirOrdem(peca) {
    const mapaOrdem = {
        "Quadrado": 1,
        "Circulo": 2,
        "Hexagono": 3
    };

    return mapaOrdem[peca] || 999;
}

// ===============================
// 📦 ENVIO DA ENTREGA (POST /entregas)
// ===============================

async function enviarEntrega() {

    const p1 = selectPeca1.value;
    const p2 = selectPeca2.value;
    const p3 = selectPeca3.value;

    const ok1 = validar("Peça 1", p1);
    const ok2 = validar("Peça 2", p2);
    const ok3 = validar("Peça 3", p3);

    if (!ok1 || !ok2 || !ok3) {
        alert("🚫 Selecione as 3 peças antes de enviar a entrega!");
        return;
    }

    // Monta a lista de produtos já com a ordem automática
const produtosOrdenados = [
    { produto: p1, ordem: definirOrdem(p1) },
    { produto: p2, ordem: definirOrdem(p2) },
    { produto: p3, ordem: definirOrdem(p3) }
];

const jsonFinal = {
    descricao: "...",
    produtos: produtosOrdenados
};

    console.log("JSON final com ordenação automática:");
    console.log(jsonFinal);

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Erro: Nenhum token encontrado! Login automático falhou.");
        return;
    }

    console.log("Token encontrado:", token);

    try {
        const response = await fetch("http://localhost:3000/entregas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(jsonFinal)
        });

        if (!response.ok) {
            throw new Error(`Erro ao enviar entrega: ${response.status}`);
        }

        const resultado = await response.json();

        console.log("Resposta do servidor:", resultado);

        alert("✅ Entrega cadastrada com sucesso!");

    } catch (error) {
        console.error("Erro ao enviar entrega:", error);
        alert("🚫 Erro ao enviar entrega!");
    }
}

botaoPedido.addEventListener("click", enviarEntrega);


window.addEventListener("load", async () => {
    console.log("Página carregada. Realizando login automático...");
    await loginAutomatico();
});
