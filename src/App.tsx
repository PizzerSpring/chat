import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css'

const socket = io('http://localhost:3001');

function App() {
    const [serverMessage, setServerMessage] = useState('Ожидание сообщений...');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Вручную подключаемся к серверу при первой загрузке компонента
        socket.connect();

        // Слушаем событие успешного подключения
        socket.on('connect', () => {
            setIsConnected(true);
        });

        // Слушаем событие отключения
        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Слушаем специальное сообщение 'hello_from_server', которое пришлет нам сервер
        socket.on('hello_from_server', (data) => {
            // Сохраняем текст из сообщения в состояние, чтобы React обновил экран
            setServerMessage(data.text);
        });

        // Важно: эта функция сработает, когда компонент "умрет" (размонтируется).
        // Мы убираем за собой слушатели, чтобы приложение не лагало и не дублировало сообщения
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('hello_from_server');
            socket.disconnect(); // отключаемся от сервера
        };
    }, [])

    const sendMessageToServer = () => {
        // .emit отправляет событие на сервер. Первым параметром пишем название, вторым — любые данные (объект)
        socket.emit('hello_from_client', { text: 'Привет, сервер! Как дела?' });
    };

  return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h1>Работа с Socket.IO</h1>
          <p>
              Статус подключения:{' '}
              <strong style={{ color: isConnected ? 'green' : 'red' }}>
                  {isConnected ? 'Подключено' : 'Отключено'}
              </strong>
          </p>

          {/* Кнопка для отправки сигнала на сервер */}
          <button onClick={sendMessageToServer} style={{ padding: '10px 20px', cursor: 'pointer' }}>
              Поздороваться с сервером
          </button>

          <div style={{ marginTop: '20px', background: '#eee', padding: '10px' }}>
              <h3>Ответ от сервера:</h3>
              <p>{serverMessage}</p>
          </div>
      </div>
  )

}

export default App
