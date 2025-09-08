document.addEventListener('DOMContentLoaded', function() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const phoneInput = document.getElementById('phone');
    const usernameSpan = document.getElementById('username');
    
    // Проверяем, авторизован ли пользователь
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        showApp(user);
    }
    
    // Обработка входа
    loginBtn.addEventListener('click', function() {
        const phone = phoneInput.value.trim();
        
        if (!phone) {
            alert('Пожалуйста, введите номер телефона');
            return;
        }
        
        // Генерируем случайное имя пользователя
        const username = 'User' + Math.floor(Math.random() * 10000);
        const user = {
            id: generateId(),
            phone: phone,
            username: username,
            avatar: 'assets/icons/user-default.png'
        };
        
        // Сохраняем пользователя
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Добавляем пользователя в список (если его там нет)
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = users.some(u => u.phone === phone);
        
        if (!userExists) {
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Показываем основное приложение
        showApp(user);
    });
    
    function showApp(user) {
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        usernameSpan.textContent = user.username;
        
        // Инициализируем чаты
        initChats();
    }
    
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
});
