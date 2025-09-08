// Глобальные переменные
let currentChatId = null;
let currentUser = null;
let chats = [];
let currentChat = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Инициализация интерфейса чата
    initChatInterface();
    
    // Загружаем чаты
    loadChats();
});

function initChatInterface() {
    // Обработчик отправки сообщения
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Обработчики кнопок интерфейса
    document.getElementById('new-chat-btn').addEventListener('click', showContacts);
    document.getElementById('close-contacts').addEventListener('click', hideContactsPanel);
}

function loadChats() {
    // Загружаем чаты из localStorage
    chats = JSON.parse(localStorage.getItem('chats') || '[]');
    
    // Если чатов нет, создаем демо-чат
    if (chats.length === 0 && currentUser) {
        const demoChat = {
            id: generateId(),
            name: 'Демо-чат',
            participants: [currentUser.id, 'demo-user'],
            isGroup: false,
            messages: [
                {
                    id: generateId(),
                    senderId: 'demo-user',
                    text: 'Добро пожаловать в Telegram Clone!',
                    timestamp: new Date().getTime() - 3600000
                },
                {
                    id: generateId(),
                    senderId: currentUser.id,
                    text: 'Привет! Спасибо, что зашли!',
                    timestamp: new Date().getTime() - 1800000
                },
                {
                    id: generateId(),
                    senderId: 'demo-user',
                    text: 'Это демонстрационная версия мессенджера с реальным временным общением',
                    timestamp: new Date().getTime() - 600000
                }
            ]
        };
        
        chats.push(demoChat);
        localStorage.setItem('chats', JSON.stringify(chats));
    }
    
    renderChats();
}

function renderChats() {
    const chatsList = document.getElementById('chats-list');
    chatsList.innerHTML = '';
    
    chats.forEach(chat => {
        const lastMessage = chat.messages.length > 0 
            ? chat.messages[chat.messages.length - 1] 
            : null;
        
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-item';
        chatElement.dataset.chatId = chat.id;
        
        chatElement.innerHTML = `
            <img src="assets/icons/group-default.png" alt="Chat" class="chat-avatar">
            <div class="chat-details">
                <span class="chat-name">${chat.name}</span>
                <span class="chat-preview">${lastMessage ? lastMessage.text : 'Нет сообщений'}</span>
            </div>
            <div class="chat-meta">
                <span class="chat-time">${lastMessage ? formatTime(lastMessage.timestamp) : ''}</span>
            </div>
        `;
        
        chatElement.addEventListener('click', function() {
            selectChat(chat.id);
        });
        
        chatsList.appendChild(chatElement);
    });
}

function selectChat(chatId) {
    currentChat = chats.find(chat => chat.id === chatId);
    currentChatId = chatId;
    
    if (!currentChat) return;
    
    // Обновляем заголовок чата
    document.getElementById('current-chat-name').textContent = currentChat.name;
    
    // Показываем поле ввода сообщения
    document.querySelector('.message-input-container').classList.remove('hidden');
    
    // Очищаем контейнер сообщений
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '';
    
    // Отображаем сообщения
    renderMessages();
    
    // Прокручиваем вниз
    scrollToBottom();
}

function renderMessages() {
    if (!currentChat) return;
    
    const messagesContainer = document.getElementById('messages-container');
    
    currentChat.messages.forEach(message => {
        const messageElement = document.createElement('div');
        const isOutgoing = message.senderId === currentUser.id;
        
        messageElement.className = `message ${isOutgoing ? 'message-outgoing' : 'message-incoming'}`;
        
        // Получаем информацию об отправителе
        let senderName = 'Unknown';
        if (message.senderId === currentUser.id) {
            senderName = 'Вы';
        } else {
            // В реальном приложении здесь бы мы искали отправителя в списке пользователей
            senderName = currentChat.isGroup ? 'Demo User' : currentChat.name;
        }
        
        messageElement.innerHTML = `
            ${currentChat.isGroup ? `<span class="message-sender">${senderName}</span>` : ''}
            <div class="message-text">${message.text}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    });
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const messageText = input.value.trim();
    
    if (messageText && currentChatId) {
        // Создаем сообщение
        const message = {
            id: Date.now(),
            text: messageText,
            senderId: currentUser.id,
            timestamp: new Date().getTime(),
            chatId: currentChatId
        };
        
        // Сохраняем сообщение
        saveMessage(message);
        
        // Добавляем сообщение в текущий чат
        if (currentChat) {
            currentChat.messages.push(message);
            
            // Обновляем чат в массиве
            const chatIndex = chats.findIndex(chat => chat.id === currentChat.id);
            if (chatIndex !== -1) {
                chats[chatIndex] = currentChat;
                localStorage.setItem('chats', JSON.stringify(chats));
            }
        }
        
        // Отображаем сообщение
        const messagesContainer = document.getElementById('messages-container');
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-outgoing';
        messageElement.innerHTML = `
            <div class="message-text">${message.text}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        
        // Очищаем поле ввода
        input.value = '';
        
        // Прокручиваем вниз
        scrollToBottom();
        
        // Отправляем через WebSocket (если подключен)
        if (window.websocket && window.websocket.readyState === WebSocket.OPEN) {
            window.websocket.send(JSON.stringify({
                type: 'message',
                data: message
            }));
        }
    }
}

function saveMessage(message) {
    // Получаем существующие сообщения
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    // Добавляем новое сообщение
    messages.push(message);
    
    // Сохраняем обратно
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // Обновляем время последнего сообщения в чате
    updateChatLastMessage(message.chatId, message.timestamp);
}

function updateChatLastMessage(chatId, timestamp) {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
        chats[chatIndex].lastMessage = timestamp;
        localStorage.setItem('chats', JSON.stringify(chats));
        
        // Обновляем список чатов
        renderChats();
    }
}

function showContacts() {
    const contactsPanel = document.querySelector('.contacts-panel');
    contactsPanel.classList.remove('hidden');
    
    // Загружаем пользователей (кроме текущего)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const otherUsers = users.filter(user => user.id !== currentUser.id);
    
    // Очищаем список контактов
    const contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '';
    
    // Добавляем контакты
    otherUsers.forEach(user => {
        const contactElement = document.createElement('div');
        contactElement.className = 'contact-item';
        contactElement.dataset.userId = user.id;
        
        contactElement.innerHTML = `
            <img src="${user.avatar || 'assets/icons/user-default.png'}" alt="Contact" class="chat-avatar">
            <div class="chat-details">
                <span class="chat-name">${user.username || user.name}</span>
            </div>
        `;
        
        contactElement.addEventListener('click', function() {
            createChat(user);
        });
        
        contactsList.appendChild(contactElement);
    });
}

function createChat(user) {
    // Проверяем, существует ли уже чат с этим пользователем
    const existingChat = chats.find(chat => 
        !chat.isGroup && 
        chat.participants.includes(currentUser.id) && 
        chat.participants.includes(user.id)
    );
    
    if (existingChat) {
        // Переходим к существующему чату
        selectChat(existingChat.id);
        document.querySelector('.contacts-panel').classList.add('hidden');
        return;
    }
    
    // Создаем новый чат
    const newChat = {
        id: generateId(),
        name: user.username || user.name,
        participants: [currentUser.id, user.id],
        isGroup: false,
        messages: []
    };
    
    chats.push(newChat);
    localStorage.setItem('chats', JSON.stringify(chats));
    
    // Обновляем список чатов
    renderChats();
    
    // Переходим к новому чату и закрываем панель контактов
    selectChat(newChat.id);
    document.querySelector('.contacts-panel').classList.add('hidden');
}

function hideContactsPanel() {
    document.querySelector('.contacts-panel').classList.add('hidden');
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
