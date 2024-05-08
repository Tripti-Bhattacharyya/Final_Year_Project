import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
 
  const [approvedAppointments, setApprovedAppointments] = useState(() => {
    // Retrieve approved appointments from local storage, or default to an empty array
    const storedApprovedAppointments = localStorage.getItem('approvedAppointments');
    return storedApprovedAppointments ? JSON.parse(storedApprovedAppointments) : [];
  });
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:9002/doctor-dashboard', {
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleApprove = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Show a confirmation dialog with options
      const confirmation = await new Promise((resolve) => {
        toast.info(
          <div className="confirmation-toast">
            <span>Are you sure you want to approve this appointment?</span>
            <button className="yes-btn" onClick={() => { toast.dismiss(); resolve(true) }}>Yes</button>
            <button className="no-btn" onClick={() => { toast.dismiss(); resolve(false); }}>No</button>
          </div>,
          {
            autoClose: false,
            position: 'top-center',
            closeButton: false,
          }
        );
      });
  
      // If user confirms, approve the appointment
      if (confirmation) {
        await axios.put(`http://localhost:9002/appointments/${appointmentId}/approve`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Update local state to mark this appointment as approved
        setApprovedAppointments(prev => [...prev, appointmentId]);
        // After approval, fetch appointments again to update the list
        localStorage.setItem('approvedAppointments', JSON.stringify([...approvedAppointments, appointmentId]));
        fetchAppointments();
        // Show a success toast notification
        toast.success("Appointment approved successfully!", {
          position: 'top-center',
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };
  
  
  
  const handleDone = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Show a confirmation dialog with options
      const confirmation = await new Promise((resolve) => {
        toast.info(
          <div className="confirmation-toast">
            <span>Are you sure you want to mark this appointment as done?</span>
            <button   className="yes-btn"  onClick={() =>{toast.dismiss();  resolve(true)}}>Yes</button>
            <button className="no-btn" onClick={() => {
              toast.dismiss(); 
              resolve(false);
            }}>No</button>
          </div>,
          {
            autoClose: false,
            position: 'top-center', // Set the position directly as a string
            closeButton: false,
            
          }
        );
      });

      // If user confirms, mark appointment as done
      if (confirmation) {
        await axios.delete(`http://localhost:9002/appointments/${appointmentId}/done`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // After marking as done, fetch appointments again to update the list
        fetchAppointments();
        // Show a success toast notification
        toast.success("Appointment marked as done successfully!", {
          position: 'top-center', // Set the position directly as a string
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error marking appointment as done:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    return formattedDate;
};

  return (
    <div className="doctor-dashboard-container">
    <h1 className='docdash-heading'>Appointments</h1>
    <ul className="appointment-list"> 
      {appointments.map(appointment => (
        <li key={appointment._id} className="appointment-item"> 
          <div className="user-name">{appointment.userId.name}</div> 
          <div className="appointment-date">Date: {formatDate(appointment.date)}</div> 
          <div className="time-slot">Time Slot: {appointment.timeSlot}</div>
          <div className="status">Status: {appointment.status}</div>
          {appointment.status !== 'Done' && !approvedAppointments.includes(appointment._id) && (
            <button className="approve-btn" onClick={() => handleApprove(appointment._id)}>Approve</button>
          )}
          {appointment.status !== 'Done' && (
            <button className="done-btn" onClick={() => handleDone(appointment._id)}>Done</button>
          )}
        </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorDashboard;



