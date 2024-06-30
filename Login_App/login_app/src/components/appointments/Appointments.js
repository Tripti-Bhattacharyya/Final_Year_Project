import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Appointments.css';
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
            const amount=response.data.fees * 100;

            
           
               
                const options = {
                    key: 'rzp_test_X50Ftg7u2gTNyg',
                    currency: 'INR',
                    name: 'Mediconnect',
                    description: 'Appointment Payment',
                    amount: amount,
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: user.phone,
                    },
                    notes: {
                        appointmentId: appointmentId
                    },
                    theme: {
                        color: '#3399cc'
                    },
                    handler: async function (response) {
                        try {
                            // Handle successful payment
                            console.log('Payment successful:', response);
                            
                            window.location.reload();
                        } catch (error) {
                            console.error('Error processing payment:', error);
                        }
                    },
                    modal: {
                        ondismiss: function () {
                           
                            console.log('Payment modal closed');
                        }
                    },
                    webhook: {
                        url: 'https://ee6e-2402-3a80-1964-b07a-70fd-22da-daf2-b2ce.ngrok-free.app/webhook',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            appointmentId: appointmentId
                        }
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
                
                
               
           
        } catch (error) {
            console.error('Error fetching doctor details:', error);
            alert('An error occurred while fetching doctor details.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        return formattedDate;
    };

    const handleChat = (doctorId) => {
        console.log('Chat button clicked');
        navigate(`/chat/${doctorId}/${user._id}`);
    };
    

    return (
        <div className="appointments-container">
            
            <h2 className='heading'>Your Appointments</h2>
            <ul className="appointments-list">
                {appointments.map(appointment => (
                    <li key={appointment._id} className="appointment-item">
                        <div className='items-list'>
                            <span className="doctor-name">Doctor: {appointment.doctorId.name}</span>
                            <span className="appointment-details">Date:{formatDate(appointment.date)}</span>
                            <span className="appointment-details"> Time: {appointment.timeSlot}</span>
                            <span className="appointment-status">Status: {appointment.status}</span>
                        </div>
                        {appointment.status === "Approved" && (
                            <div className="action-buttons">
                                <button className="payment-button" onClick={() => handlePayment(appointment.doctorId._id, appointment._id)}>Proceed to Payment</button>
                            </div>
                        )}
                        {appointment.status === "Paid" && (
                            <div className="action-buttons">
                                <button className="chat-button" onClick={() => handleChat(appointment.doctorId._id)}>Start Chat</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Appointments;











