import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css'

const socket = io('http://localhost:3001');

function App() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
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
            console.log("!!! МЫ ПОЙМАЛИ ОТВЕТ ОТ СЕРВЕРА В БРАУЗЕРЕ:", data.text);
            setMessages((prevMessages) => [...prevMessages, data]);
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

    const sendMessageToServer = (e) => {
        e.preventDefault();
        // .emit отправляет событие на сервер. Первым параметром пишем название, вторым — любые данные (объект)
        if (inputValue.trim()) {
            // Отправляем текущий текст из инпута
            socket.emit('hello_from_client', { text: inputValue });
            setInputValue(''); // Очищаем поле ввода
        }
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
          <form onSubmit={sendMessageToServer} style={{ display: 'flex', marginBottom: '20px' }}>
              <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Введите текст сообщения..."
                  style={{ flexGrow: 1, padding: '10px', fontSize: '16px' }}
              />
              <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '5px' }}>
                  Отправить
              </button>
          </form>

          <div style={{ background: '#eee', padding: '10px', minHeight: '200px', borderRadius: '4px' }}>
              <h3>История чата:</h3>
              {messages.length === 0 ? (
                  <p style={{ color: '#666' }}>Ожидание сообщений...</p>
              ) : (
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                      {messages.map((msg) => (
                          <li key={msg.id} style={{ padding: '6px', background: '#fff', marginBottom: '5px', borderRadius: '4px', border: '1px solid #ddd' }}>
                              {msg.text}
                          </li>
                      ))}
                  </ul>
              )}
          </div>

      </div>
  )

}

export default App
