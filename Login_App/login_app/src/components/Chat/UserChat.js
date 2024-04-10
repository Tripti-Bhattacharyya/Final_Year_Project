import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './UserChat.css'; // Import CSS file

const UserChat = (user) => {
    console.log(user.user);
    const { userId, doctorId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = useRef(null); // Store socket instance in a ref

    const messageInputRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection only once
        socket.current = io('http://localhost:9002', {
            query: {
                userId: user.user, // Assuming you have userId defined
            }
        });

        // Retrieve initial messages
        socket.current.emit('getMessages', { userId, doctorId });

        // Listen for new messages
        socket.current.on('messages', (messages) => {
            setMessages(messages);
        });

        // Clean up event listeners
        return () => {
            if (socket.current) {
                socket.current.off('messages');
            }
        };
    }, [doctorId, userId, user.user]);

    const handleMessageSend = () => {
        if (newMessage.trim() === '') return;
        socket.current.emit('sendMessage', { userId, doctorId, content: newMessage });
        setNewMessage('');
        // Focus the input field after sending the message
        messageInputRef.current.focus();
    };

    // Listen for incoming messages
    useEffect(() => {
        if (!socket.current) return;

        const handleNewMessage = (message) => {
            setMessages(prevMessages => [...prevMessages, message]); // Append the new message to the list
        };

        socket.current.on('message', handleNewMessage);

        return () => {
            socket.current.off('message', handleNewMessage); // Clean up event listener
        };
    }, []);

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
