import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './booking.css';

const Booking = ({ user }) => {
  const { doctorId } = useParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  
  useEffect(() => {
    const checkAppointmentStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:9002/check-appointment/${doctorId}/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200 && response.data) {
          setBookingStatus('Already Booked');
          setAppointmentId(response.data._id); 
          
          toast.error('Already Booked', {
            position: 'top-center',
            autoClose: 3000
          });
        }  else {
          setBookingStatus('');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setBookingStatus('');
        } else {
          console.error('Error checking appointment status:', error);
          setBookingStatus('Error checking appointment status');
        }
      }
    };

    checkAppointmentStatus();
  }, [doctorId]);

  const handleBooking = async () => {
    if (isBooking) return; 
    setIsBooking(true); 
  
    try {
      const token = localStorage.getItem('token');
      if (bookingStatus === 'Already Booked') {
        await axios.delete(`http://localhost:9002/cancel-appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAppointmentId(''); 
        setBookingStatus(''); 
        toast.success('Appointment Cancelled', {
          position: 'top-center',
          autoClose: 3000
        });
      } else {
        const response = await axios.post(`http://localhost:9002/book-appointment/${doctorId}`, {
          selectedDate,
          selectedTimeSlot,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAppointmentId(response.data.appointmentId);
        setBookingStatus(response.data.message);
        toast.success('Appointment Booked Successfully', {
          position: 'top-center',
          autoClose: 3000
        });
      }
     
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'The selected time slot is already booked') {
        setBookingStatus('The selected time slot is already booked');
      } else {
        console.error('Error booking or cancelling appointment:', error);
        setBookingStatus('Error processing appointment');
      }

      toast.error(bookingStatus, {
        position: 'top-center',
        autoClose: 3000
      });
    } finally {
      setIsBooking(false); 
    }
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem('bookingStatus');
      localStorage.removeItem('appointmentId');
    };
  }, []);

  return (
    <div className='booking-wrapper'>
      <div className="booking-container">
        <h2 className="booking-title">Book Appointment</h2>
        <div className="booking-form">
          <label className="booking-label">Select Date:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="booking-input" />
          <label className="booking-label">Select Time Slot:</label>
          <select value={selectedTimeSlot} onChange={(e) => setSelectedTimeSlot(e.target.value)} className="booking-input">
            <option value="select time">Select Time</option>
            <option value="9:00 AM">9:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="12:00 AM">12:00 AM</option>
          </select>
          <button onClick={handleBooking} className="booking-button">
            {bookingStatus === 'Already Booked' ? 'Cancel' : 'Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Booking;






