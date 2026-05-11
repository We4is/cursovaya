const tabBtns = document.querySelectorAll('.buttons_container button');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (btn.dataset.panel === 'login') {
      formLogin.style.display = '';
      formRegister.style.display = 'none';
    } else {
      formLogin.style.display = 'none';
      formRegister.style.display = '';
    }
  });
});

formLogin.addEventListener('submit', e => {
  e.preventDefault();
  window.location.href = 'error.html';
});

formRegister.addEventListener('submit', e => {
  e.preventDefault();
  window.location.href = 'error.html';
});