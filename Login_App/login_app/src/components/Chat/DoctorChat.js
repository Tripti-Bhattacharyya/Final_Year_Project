import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

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
        <div>
            <h2>Doctor Chat</h2>
            <ul>
                {users.map(user => (
                    <li key={user._id}>
                        <Link to={`/chat/${doctorId}/${user._id}`}>{user.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DoctorChat;


