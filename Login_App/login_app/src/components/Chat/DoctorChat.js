import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import './DoctorChat.css';
const DoctorChat = ({ doctorId }) => {
    const [users, setUsers] = useState([]);
    console.log("Doctor ID:", doctorId);

    useEffect(() => {
        const socket = io('http://localhost:9002');

        socket.emit('getUsers', doctorId);

        socket.on('users', (users) => {
            console.log(users);
            setUsers(users);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        
            <div className="doctor-chat-container">
                <h2 className="doctor-chat-heading">Doctor Chat</h2>
                <ul className="user-list">
                    {users.map(user => (
                        <li key={user._id} className="user-item">
                            <Link to={`/chat/${doctorId}/${user._id}`} className="user-link">{user.name}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };
    
export default DoctorChat;


