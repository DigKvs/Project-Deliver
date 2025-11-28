document.addEventListener('DOMContentLoaded', () => {
    const botoesAlternar = document.querySelectorAll('.loginText');
    const imgLogin = document.querySelector('.imgLogin');
    const areaLogin = document.querySelector('.login');
    const areaRegister = document.querySelector('.register');



    botoesAlternar.forEach(botao => {
        botao.addEventListener('click', () => {

            if (imgLogin.classList.contains('animationLogin')) {

                imgLogin.classList.remove('animationLogin'); 
            } else {

                imgLogin.classList.add('animationLogin'); 
            }
        });
    });
});

paginaPedido = () => {
    let urlPedido = "pedidos.html";
    window.location.href = urlPedido;
}