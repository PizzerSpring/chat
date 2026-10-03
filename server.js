

const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);

const {Server} = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`Пользователь подключился. ID: ${socket.id}`);

    // Слушаем кастомное событие 'chat message' от этого клиента
    socket.on('hello_from_client', (data) => {
        console.log(`Получено сообщение: ${data.text}`);

        // Переотправляем сообщение всем подключенным клиентам (включая отправителя)
        io.emit('hello_from_server', `Эхо от сервера: ${data}`);
    });

    // Событие: отключение клиента
    socket.on('disconnect', () => {
        console.log(`Пользователь отключился. ID: ${socket.id}`);
    });
});

const PORT = 3001;

app.get('/', (req, res) => {
    res.send('Привет, мир! Сервер на Express работает.');
});

server.listen(PORT, () => {
    console.log(`Сервер успешно запущен! Перейдите по адресу: http://localhost:${PORT}`);
});
