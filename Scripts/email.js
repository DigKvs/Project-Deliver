// Função para decodificar o JWT (sem precisar de bibliotecas externas)
function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Token inválido ou corrompido", e);
        return null;
    }
}

// Função principal que roda ao carregar a página
window.addEventListener("load", () => {
    const token = localStorage.getItem("token");
    const emailDisplay = document.getElementById("userEmailDisplay");

    if (token) {
        const dadosUsuario = decodificarToken(token);
        
        if (dadosUsuario && dadosUsuario.email) {
            // Injeta o email dentro do span
            emailDisplay.innerText = dadosUsuario.email;
            console.log("Email carregado no ícone:", dadosUsuario.email);
        } else {
            emailDisplay.innerText = "Email não encontrado";
        }
    } else {
        // Se não tiver token, talvez esconder o ícone ou mostrar "Visitante"
        emailDisplay.innerText = "Não logado";
    }
});