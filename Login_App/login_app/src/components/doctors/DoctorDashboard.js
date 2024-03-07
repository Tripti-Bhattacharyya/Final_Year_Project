// DoctorDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:9002/doctor-dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleApprove = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:9002/appointments/${appointmentId}/approve`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // After approval, fetch appointments again to update the list
      fetchAppointments();
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <h2>Appointments</h2>
      <ul>
        {appointments.map(appointment => (
          <li key={appointment._id}>
            <div>User: {appointment.userId.name}</div>
            <div>Date: {appointment.date}</div>
            <div>Time Slot: {appointment.timeSlot}</div>
            <div>Status: {appointment.status}</div>
            {appointment.status === 'Pending' && (
              <button onClick={() => handleApprove(appointment._id)}>Approve</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorDashboard;



