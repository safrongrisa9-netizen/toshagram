// При загрузке проверяем, есть ли сохраненные данные пользователя
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('username').textContent = user.name;
        
        // Загружаем чаты и сообщения
        loadUserChats(user.id);
    }
});

document.getElementById('login-btn').addEventListener('click', function() {
    const phone = document.getElementById('phone').value;
    const name = document.getElementById('username-input').value;
    
    if (phone && name) {
        // Сохраняем пользователя
        const user = {
            id: generateUserId(),
            phone: phone,
            name: name
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Переходим в чат
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('username').textContent = name;
        
        // Загружаем чаты
        loadUserChats(user.id);
    } else {
        alert('Пожалуйста, заполните все поля');
    }
});

function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

function loadUserChats(userId) {
    // Загрузка чатов из localStorage
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const userChats = chats.filter(chat => chat.participants.includes(userId));
    
    // Отображаем чаты
    displayChats(userChats);
}
