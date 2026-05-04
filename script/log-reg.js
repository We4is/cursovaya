const logBtn = document.getElementsByClassName("login");
const regBtn = document.getElementsByClassName("registration");
const sbmBtn = document.getElementsByClassName("sbm_btn");
const inputBox = document.getElementsByClassName("input_box");

function switchForm(newContent, newButtonText, isRegister) {
    inputBox[0].style.opacity = '0';
    
    setTimeout(() => {
        inputBox[0].innerHTML = newContent;
        sbmBtn[0].innerHTML = newButtonText;
        inputBox[0].style.opacity = '1';
    }, 150);
    
    if (isRegister) {
        logBtn[0].classList.remove("active");
        regBtn[0].classList.add("active");
    } else {
        regBtn[0].classList.remove("active");
        logBtn[0].classList.add("active");
    }
}

regBtn[0].addEventListener('click', () => {
    switchForm(`
        <input type="text" placeholder="ФИО контатного лица">
        <input type="text" placeholder="Телефон контактного лица">
        <input type="email" placeholder="E-mail организации">
        <input type="text" placeholder="ИНН организации">
    `, 'Зарегистрироваться', true);
});

logBtn[0].addEventListener('click', () => {
    switchForm(`
        <input type="email" placeholder="Введите ваш E-mail">
        <input type="password" placeholder="Введите ваш пароль">
    `, 'Войти', false);
});
