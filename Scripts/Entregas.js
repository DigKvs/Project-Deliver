// ===============================
// IMPORTAÇÃO CORRETA
// ===============================
import { pedidoFinal } from "../pino3d.js";


// ===============================
// 🔐 VERIFICAÇÃO DE AUTENTICAÇÃO
// ===============================
window.addEventListener("load", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("🚫 Acesso negado! Faça login primeiro.");
        window.location.href = "index.html";
        return;
    }

    console.log("✅ Token carregado. Usuário autenticado.");
});


// ===============================
// BOTÃO DO HTML
// ===============================
const botaoPedido = document.getElementById("buttonPedido");


// ===============================
// 🧪 VALIDAÇÃO DO PEDIDO
// ===============================
function validarPedido(pedido) {
    const p1 = pedido.pino1;

    if (!p1.slot1 && !p1.slot2 && !p1.slot3) {
        return { ok: false, message: "O Pino 1 está vazio." };
    }

    return { ok: true };
}


// ===============================
// 🔄 NOVA FUNÇÃO → Junta todos os pinos em UM JSON
// ===============================
function gerarProdutosUnificados(pedido) {
    const listaProdutos = [];
    const slots = ['slot1', 'slot2', 'slot3']; // Garante a ordem de leitura

    // --- Função auxiliar interna para evitar repetição de código ---
    const processarPino = (pinoData, adicionarNaOrdem) => {
        if (!pinoData) return; // Se o pino não existir, ignora

        slots.forEach((slotName, index) => {
            const item = pinoData[slotName];

            // Se existe item e não é vazio
            if (item && item.trim() !== "") {
                listaProdutos.push({
                    produto: item,
                    // Se for pino 1: index (0) + 1 + 0 = Ordem 1
                    // Se for pino 2: index (0) + 1 + 3 = Ordem 4
                    ordem: index + 1 + adicionarNaOrdem 
                });
            }
        });
    };

    // 1. Processa Pino 1 (Começa na ordem 1)
    processarPino(pedido.pino1, 0);

    // 2. Processa Pino 2 (Começa na ordem 4), se existir
    processarPino(pedido.pino2, 3);

    return listaProdutos;
}


// ===============================
// ✈️ FUNÇÃO DE ENVIO PARA API
// ===============================
async function enviarEntrega() {

    // 1 — validação básica
    const check = validarPedido(pedidoFinal);
    if (!check.ok) {
        alert("Erro: " + check.message);
        return;
    }

    // 2 — gera o JSON unificado (como você pediu!)
    const produtosFinal = gerarProdutosUnificados(pedidoFinal);

    if (produtosFinal.length < 4) {
    for (let i = 1; i < 4; i++) {
        produtosFinal.push({ produto: "-" });
    }
}

    const jsonFinal = {
        descricao: "Entrega do pino 3D",
        produtos: produtosFinal
    };

    console.log("📦 JSON FINAL MONTADO:");
    console.log(jsonFinal);

    // 3 — pega token
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Sessão encerrada. Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    // 4 — faz a requisição
    try {
        const response = await fetch("http://localhost:3000/entregas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(jsonFinal)
        });

        if (response.status === 401 || response.status === 403) {
            alert("Sua sessão expirou. Faça login novamente.");
            localStorage.removeItem("token");
            window.location.href = "index.html";
            return;
        }

        if (!response.ok) {
            const erroData = await response.json().catch(() => ({
                message: "Erro desconhecido no servidor."
            }));
            throw new Error(erroData.message);
        }

        const resultado = await response.json();
        console.log("🎉 Sucesso:", resultado);
        alert("Entrega cadastrada com sucesso!");

    } catch (err) {
        console.error("❌ Erro ao enviar:", err);
        alert("Erro ao enviar: " + err.message);
    }
}


// ===============================
// EVENTO DO BOTÃO
// ===============================
if (botaoPedido) {
    botaoPedido.addEventListener("click", (e) => {
        e.preventDefault();
        enviarEntrega();
    });

    console.log("🔘 Evento ligado ao botão 'buttonPedido'");
} else {
    console.error("❌ Botão 'buttonPedido' NÃO encontrado!");
}
