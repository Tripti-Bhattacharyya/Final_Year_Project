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
            const amount=response.data.fees * 100;

            
           
                // Directly open Razorpay checkout for payment
                const options = {
                    key: 'rzp_test_X50Ftg7u2gTNyg',
                    currency: 'INR',
                    name: 'Medicare',
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
                        url: 'https://fe4b-202-8-112-195.ngrok-free.app/webhook',
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











