let currentChat = null;
let chats = [];

document.addEventListener('DOMContentLoaded', function() {
    const chatsList = document.getElementById('chats-list');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messageInputContainer = document.querySelector('.message-input-container');
    const newChatBtn = document.querySelector('.new-chat-btn');
    const contactsList = document.getElementById('contacts-list');
    
    // Загружаем чаты
    loadChats();
    
    // Обработчик отправки сообщения
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Обработчик создания нового чата
    newChatBtn.addEventListener('click', function() {
        showContacts();
    });
    
    function loadChats() {
        // Загружаем чаты из localStorage
        chats = JSON.parse(localStorage.getItem('chats') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Если чатов нет, создаем демо-чат
        if (chats.length === 0) {
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
        
        if (!currentChat) return;
        
        // Обновляем заголовок чата
        document.getElementById('current-chat-name').textContent = currentChat.name;
        
        // Показываем поле ввода сообщения
        messageInputContainer.classList.remove('hidden');
        
        // Очищаем контейнер сообщений
        messagesContainer.innerHTML = '';
        
        // Отображаем сообщения
        renderMessages();
        
        // Прокручиваем вниз
        scrollToBottom();
    }
    
    function renderMessages() {
        if (!currentChat) return;
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
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
        if (!currentChat || !messageInput.value.trim()) return;
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const newMessage = {
            id: generateId(),
            senderId: currentUser.id,
            text: messageInput.value.trim(),
            timestamp: new Date().getTime()
        };
        
        // Добавляем сообщение в чат
        currentChat.messages.push(newMessage);
        
        // Обновляем чат в массиве
        const chatIndex = chats.findIndex(chat => chat.id === currentChat.id);
        if (chatIndex !== -1) {
            chats[chatIndex] = currentChat;
            localStorage.setItem('chats', JSON.stringify(chats));
        }
        
        // Отображаем сообщение
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-outgoing';
        messageElement.innerHTML = `
            <div class="message-text">${newMessage.text}</div>
            <div class="message-time">${formatTime(newMessage.timestamp)}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        
        // Очищаем поле ввода и прокручиваем вниз
        messageInput.value = '';
        scrollToBottom();
        
        // В реальном приложении здесь бы мы отправляли сообщение через WebSocket
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify({
                type: 'message',
                chatId: currentChat.id,
                message: newMessage
            }));
        }
    }
    
    function showContacts() {
        const contactsPanel = document.querySelector('.contacts-panel');
        contactsPanel.classList.remove('hidden');
        
        // Загружаем пользователей (кроме текущего)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const otherUsers = users.filter(user => user.id !== currentUser.id);
        
        // Очищаем список контактов
        contactsList.innerHTML = '';
        
        // Добавляем контакты
        otherUsers.forEach(user => {
            const contactElement = document.createElement('div');
            contactElement.className = 'contact-item';
            contactElement.dataset.userId = user.id;
            
            contactElement.innerHTML = `
                <img src="${user.avatar}" alt="Contact" class="chat-avatar">
                <div class="chat-details">
                    <span class="chat-name">${user.username}</span>
                </div>
            `;
            
            contactElement.addEventListener('click', function() {
                createChat(user);
            });
            
            contactsList.appendChild(contactElement);
        });
        
        // Обработчик закрытия панели контактов
        document.querySelector('.close-contacts').addEventListener('click', function() {
            contactsPanel.classList.add('hidden');
        });
    }
    
    function createChat(user) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
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
            name: user.username,
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
    
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
});
