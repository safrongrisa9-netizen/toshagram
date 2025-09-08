document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, согласился ли пользователь с политикой ранее
    if (localStorage.getItem('policyAgreed') === 'true') {
        document.getElementById('welcome-container').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
    }
    
    // Обработка согласия с политикой
    const policyCheckbox = document.getElementById('policy-agree');
    const startBtn = document.getElementById('start-btn');
    
    policyCheckbox.addEventListener('change', function() {
        startBtn.disabled = !this.checked;
    });
    
    // Обработка кнопки начала
    startBtn.addEventListener('click', function() {
        if (policyCheckbox.checked) {
            localStorage.setItem('policyAgreed', 'true');
            document.getElementById('welcome-container').classList.add('hidden');
            document.getElementById('auth-container').classList.remove('hidden');
        }
    });
    
    // Обработка выхода
    document.getElementById('logout-btn').addEventListener('click', function() {
        // Не очищаем данные, только переходим к приветственному экрану
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('welcome-container').classList.remove('hidden');
    });
});
