// Подключение к WebSocket серверу для реального времени
document.addEventListener('DOMContentLoaded', function() {
    // В реальном приложении здесь бы был адрес вашего WebSocket сервера
    // const ws = new WebSocket('wss://your-websocket-server.com');
    
    // Для демонстрации мы имитируем WebSocket соединение
    console.log('WebSocket подключение было бы установлено здесь');
    
    // Имитация получения сообщения
    setInterval(() => {
        if (Math.random() > 0.9 && currentChat) {
            const demoMessages = [
                'Привет! Как дела?',
                'Что нового?',
                'Ты уже пробовал это приложение?',
                'Классный дизайн, правда?',
                'Реальное время работает отлично!'
            ];
            
            const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
            
            const newMessage = {
                id: generateId(),
                senderId: 'demo-user',
                text: randomMessage,
                timestamp: new Date().getTime()
            };
            
            // Добавляем сообщение в текущий чат
            currentChat.messages.push(newMessage);
            
            // Обновляем чат в массиве
            const chatIndex = chats.findIndex(chat => chat.id === currentChat.id);
            if (chatIndex !== -1) {
                chats[chatIndex] = currentChat;
                localStorage.setItem('chats', JSON.stringify(chats));
            }
            
            // Если этот чат активен, отображаем сообщение
            if (document.getElementById('current-chat-name').textContent === currentChat.name) {
                const messagesContainer = document.getElementById('messages-container');
                
                const messageElement = document.createElement('div');
                messageElement.className = 'message message-incoming';
                
                messageElement.innerHTML = `
                    ${currentChat.isGroup ? '<span class="message-sender">Demo User</span>' : ''}
                    <div class="message-text">${newMessage.text}</div>
                    <div class="message-time">${formatTime(newMessage.timestamp)}</div>
                `;
                
                messagesContainer.appendChild(messageElement);
                scrollToBottom();
            }
        }
    }, 5000);
    
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function scrollToBottom() {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
