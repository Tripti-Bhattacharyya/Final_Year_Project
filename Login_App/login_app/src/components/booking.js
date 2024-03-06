// Booking.js

import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Booking = () => {
  const { doctorId } = useParams(); // Extracting doctorId from URL params
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');

  const handleBooking = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(`http://localhost:9002/book-appointment/${doctorId}`, {
        selectedDate,
        selectedTimeSlot,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBookingStatus(response.data.message);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setBookingStatus('Error booking appointment');
    }
  };

  return (
    <div>
      <h2>Book Appointment</h2>
      <label>Select Date:</label>
      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      <label>Select Time Slot:</label>
      <select value={selectedTimeSlot} onChange={(e) => setSelectedTimeSlot(e.target.value)}>
        <option value="9:00 AM">9:00 AM</option>
        <option value="10:00 AM">10:00 AM</option>
        {/* Add more time slots as needed */}
      </select>
      <button onClick={handleBooking}>Book</button>
      {bookingStatus && <p>{bookingStatus}</p>}
    </div>
  );
};

export default Booking;


