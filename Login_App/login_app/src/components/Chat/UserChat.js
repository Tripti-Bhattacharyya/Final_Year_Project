import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const UserChat = () => {
    const { userId, doctorId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = io('http://localhost:9002');
    const messageInputRef = useRef(null);

    useEffect(() => {
        socket.emit('getMessages', { userId, doctorId });

        socket.on('messages', (messages) => {
            setMessages(messages);
        });

        return () => {
            socket.off('messages');
        };
    }, [doctorId, userId]);

    const handleMessageSend = () => {
        if (newMessage.trim() === '') return;
        socket.emit('sendMessage', { userId, doctorId, content: newMessage });
        setNewMessage('');
        // Focus the input field after sending the message
        messageInputRef.current.focus();
    };

    return (
        <div>
            <h2>Chat</h2>
            <div>
                {messages.map((message, index) => (
                    <div key={index}>
                        <p>{message.content}</p>
                        <span>{message.createdAt}</span>
                    </div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    ref={messageInputRef}
                />
                <button onClick={handleMessageSend}>Send</button>
            </div>
        </div>
    );
};

export default UserChat;
