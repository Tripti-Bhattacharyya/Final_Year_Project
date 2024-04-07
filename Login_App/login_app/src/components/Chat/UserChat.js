import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './UserChat.css'; // Import CSS file

const UserChat = (user) => {
  
    console.log(user.user);
    const { userId, doctorId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = io('http://localhost:9002', {
        query: {
            userId: user.user,       // Assuming you have userId defined
              
        }
    });
    
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
        <div className="user-chat-container">
            <h2>Chat</h2>
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.senderId === user.user ? 'left' : 'right'}`}>
                        <p className="message-content">{message.content}</p>
                        <span className="message-timestamp">{message.createdAt}</span>
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    ref={messageInputRef}
                    className="message-input"
                />
                <button onClick={handleMessageSend} className="send-button">Send</button>
            </div>
        </div>
    );
};

export default UserChat;

