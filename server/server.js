const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

// Хранение подключений пользователей
const users = new Map();

wss.on('connection', function connection(ws) {
    console.log('Новое подключение');
    
    ws.on('message', function incoming(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'register':
                    // Регистрация пользователя
                    users.set(message.userId, ws);
                    console.log(`Пользователь ${message.userId} зарегистрирован`);
                    break;
                    
                case 'message':
                    // Отправка сообщения
                    const chatParticipants = getChatParticipants(message.chatId);
                    
                    chatParticipants.forEach(userId => {
                        const userWs = users.get(userId);
                        if (userWs && userWs.readyState === WebSocket.OPEN) {
                            userWs.send(JSON.stringify({
                                type: 'new_message',
                                chatId: message.chatId,
                                message: message.message
                            }));
                        }
                    });
                    break;
                    
                case 'typing':
                    // Уведомление о наборе текста
                    const chatMembers = getChatParticipants(message.chatId);
                    
                    chatMembers.forEach(userId => {
                        if (userId !== message.userId) {
                            const userWs = users.get(userId);
                            if (userWs && userWs.readyState === WebSocket.OPEN) {
                                userWs.send(JSON.stringify({
                                    type: 'user_typing',
                                    chatId: message.chatId,
                                    userId: message.userId,
                                    isTyping: message.isTyping
                                }));
                            }
                        }
                    });
                    break;
            }
        } catch (error) {
            console.error('Ошибка обработки сообщения:', error);
        }
    });
    
    ws.on('close', function() {
        // Удаляем пользователя при отключении
        users.forEach((value, key) => {
            if (value === ws) {
                users.delete(key);
                console.log(`Пользователь ${key} отключился`);
            }
        });
    });
});

function getChatParticipants(chatId) {
    // В реальном приложении здесь бы мы получали участников чата из базы данных
    // Для демонстрации возвращаем mock данные
    return ['user1', 'user2'];
}

server.listen(PORT, function() {
    console.log(`Сервер запущен на порту ${PORT}`);
});
