const loginArea = document.querySelector(".login");
const registerArea = document.querySelector(".register");

document.querySelectorAll(".loginButton").forEach(btn => {
    btn.addEventListener("click", () => {
        loginArea.classList.toggle("hidden");
        registerArea.classList.toggle("hidden");
    });
});

async function fazerLogin() {
    const email = registerArea.querySelector("input[name='Email']").value;
    const senha = registerArea.querySelector("input[name='Senha']").value;

    if (!email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: senha })
        });

        const data = await response.json();

        if (!response.ok) {
            alert("Erro no login: " + data.message);
            return;
        }

        localStorage.setItem("token", data.token);

        alert("Login realizado com sucesso!");
        console.log("TOKEN:", data.token);

        // Redirecionar para página principal
        window.location.href = "home.html";

    } catch (err) {
        console.error("Erro:", err);
        alert("Falha na comunicação com o servidor.");
    }
}

document.querySelector(".loginConfirm").addEventListener("click", fazerLogin);

async function registrarUsuario() {
    const nome = document.getElementById("Nome").value;
    const email = document.getElementById("EmailRegister").value;
    const senha = document.getElementById("SenhaRegister").value;
    const termos = document.getElementById("terms").checked;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    if (senha.lenght < 6){
        alert("Precisa ter pelo menos 6 caracteres");
        return;
    }

    if (!termos) {
        alert("Você precisa aceitar os termos.");
        return;
    }

    try {
         const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: nome,
                email: email,
                password: senha
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert("Erro: " + data.message);
            return;
        }

        alert("Usuário registrado!");
    } catch (err) {
        console.error(err);
        alert("Falha ao conectar ao servidor.");
    }
}

document.querySelector(".registerConfirm").addEventListener("click", registrarUsuario);