import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Appointments = ({ user }) => {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:9002/appointments/${user._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const filteredAppointments = response.data.filter(appointment => appointment.status !== 'Cancelled');
                setAppointments(filteredAppointments);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        fetchAppointments();
    }, [user._id]);

    const handlePayment = async (doctorId, appointmentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:9002/doctors/${doctorId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const razorpayLink = response.data.razorpayLink;
            if (razorpayLink) {
                window.open(razorpayLink, '_blank');
                // Assuming there's an API to update appointment status after payment
                await axios.patch(`http://localhost:9002/appointments/${appointmentId}`, { status: 'Paid' }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Update appointment status locally
                const updatedAppointments = appointments.map(appointment => {
                    if (appointment._id === appointmentId) {
                        return { ...appointment, status: 'Paid' };
                    }
                   
                    return appointment;
                });
                setAppointments(updatedAppointments);
               
            } else {
                console.error('Razorpay link not found for the doctor');
                alert('Payment link is not available for this doctor.');
            }
        } catch (error) {
            console.error('Error fetching doctor details:', error);
            alert('An error occurred while fetching doctor details.');
        }
    };

    const handleChat = (doctorId) => {
        console.log('Chat button clicked');
        navigate(`/chat/${doctorId}/${user._id}`);
    };
    

    return (
        <div>
            <h2>Your Appointments</h2>
            <ul>
                {appointments.map(appointment => (
                    <li key={appointment._id}>
                        Doctor: {appointment.doctorId.name}, Date: {appointment.date}, Time: {appointment.timeSlot}, Status: {appointment.status}
                        {appointment.status === "Approved" && (
                            <div>
                                <button onClick={() => handlePayment(appointment.doctorId._id, appointment._id)}>Proceed to Payment</button>
                               

                            </div>
                        )}
                        {appointment.status === "Paid" && (
                                    <button onClick={() => handleChat(appointment.doctorId._id)}>Start Chat</button>

                            )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Appointments;





