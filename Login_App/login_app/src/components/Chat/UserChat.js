import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './UserChat.css'; // Import CSS file

const UserChat = (user) => {
    console.log(user.user);
    const { userId, doctorId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const socket = useRef(null); // Store socket instance in a ref

    const messageInputRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection only once
        socket.current = io('http://localhost:9002', {
            query: {
                userId: user.user,
            }
        });
    
        // Retrieve initial messages
        socket.current.emit('getMessages', { userId, doctorId });
    
        // Listen for new messages
        socket.current.on('messages', (initialMessages) => {
            setMessages(initialMessages);
        });
    
        // Log when setting up the event listener for incoming messages
        console.log("Setting up event listener for incoming messages");
    
        // Listen for incoming messages
        socket.current.on('message', (message) => {
            console.log("Received message:", message);
            setMessages(prevMessages => [...prevMessages, message]); // Append the new message to the list
        });
    
        // Clean up event listeners
        return () => {
            if (socket.current) {
                socket.current.off('messages');
                socket.current.off('message');
            }
        };
    }, [doctorId, user.user]);
    
    const handleMessageSend = () => {
        if (newMessage.trim() === '' && !file) return;
    
        const message = {
            userId: userId,
            doctorId: doctorId,
            content: newMessage.trim() !== '' ? newMessage : null,
            file: file ? {
                name: file.name,
                contentType: file.type,
                data: file 
            } : null
        };
    
        socket.current.emit('sendMessage', message);
    
        setNewMessage('');
        setFile(null);
        messageInputRef.current.focus();
    };
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleFileDownload = async (messageId, fileName) => {
        try {
            // Fetch the file data from the backend
            const response = await fetch(`http://localhost:9002/files/${messageId}`);
            
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Failed to download file');
            }
            
            // Convert the file data to a Blob object
            const fileBlob = await response.blob();
            
            // Create a temporary URL for the file blob
            const fileUrl = URL.createObjectURL(fileBlob);
            
            // Create a link element to trigger the file download
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            
            // Trigger the click event to start the download
            link.click();
            
            // Clean up by revoking the object URL
            URL.revokeObjectURL(fileUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
            // Handle error appropriately (e.g., show error message to user)
        }
    };

    return (
        <div className="user-chat-container">
            <h2>Chat</h2>
            <div className="chat-messages">
            {messages.map((message) => (
    <div key={message._id} className={`message ${message.senderId === user.user ? 'left' : 'right'}`}>
        {message.fileName && message.fileData ? (
            <div>
                {message.contentType.startsWith('image') ? (
                    <div>
                        <p>Image: {message.fileName}</p>
                        <img src={`data:${message.contentType};base64,${message.fileData}`} alt={message.fileName} style={{ maxWidth: '30%', maxHeight: '50%' }} />
                    </div>
                ) : (
                    <div>
                        <p>File: {message.fileName}</p>
                        <button onClick={() => handleFileDownload(message._id, message.fileName)}>Download</button>
                    </div>
                )}
            </div>
        ) : (
            <div>
                <p className="message-content">{message.content}</p>
            </div>
        )}
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
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleMessageSend} className="send-button">Send</button>
            </div>
        </div>
    );
};

export default UserChat;






