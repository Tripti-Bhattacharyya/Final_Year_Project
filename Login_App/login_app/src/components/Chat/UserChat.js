import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './UserChat.css'; 


const UserChat = (user) => {
    console.log(user.user);
    const { userId, doctorId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const socket = useRef(null); // Store socket instance in a ref

    const messageInputRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState('');

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

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
        return `${formattedDate} ${formattedTime}`;
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
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(prevState => !prevState);
    };
    
    const handleEmojiClick = (emoji) => {
        setSelectedEmoji(emoji);
        setNewMessage(prevMessage => prevMessage + emoji);
    };
    // Emojis array
const emojis = [
    "😊", "❤️", "😂", "😍", "😎", "👍", "👋", "🤔", "🎉", "🔥",
    "🥳", "😇", "😘", "🥰", "😋", "🤩", "💪", "🌟", "🌈", "💖", 
   
];


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
                                       
                                        <img src={`data:${message.contentType};base64,${message.fileData}`} alt={message.fileName} style={{ maxWidth: '30%', maxHeight: '50%' }} />
                                    </div>
                                ) : (
                                    <div>
                                        <p>{message.fileName}</p>
                                        <button onClick={() => handleFileDownload(message._id, message.fileName)}>Download</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p className="message-content">{message.content}</p>
                            </div>
                        )}
                        <span className="message-timestamp">{formatTimestamp(message.createdAt)}</span>
                    </div>
                ))}
            </div>
            <div className="input-container">
            
        <button onClick={toggleEmojiPicker} className="emoji-button">&#x1F60A;</button> {/* Smiley icon */}
        {showEmojiPicker && (
            <div className="emoji-picker">
                {emojis.map((emoji, index) => (
                    <span key={index} onClick={() => handleEmojiClick(emoji)}>{emoji}</span>
                ))}
            </div>
        )}
    
    <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        ref={messageInputRef}
        className="message-input"
        placeholder='Type your message here....'
    />
   
    <label className="file-label">
        <input type="file" onChange={handleFileChange} className="file-input" />
        <span className="file-icon">&#128206;</span> {/* Unicode for paperclip icon */}
    </label>
    <button onClick={handleMessageSend} className="send-button"><i className="fa fa-paper-plane"></i></button>
</div>

        </div>
    );
};

export default UserChat;







