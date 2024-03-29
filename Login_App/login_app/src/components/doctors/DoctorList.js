// DoctorList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './DoctorList.css';
const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:9002/doctors');
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div>
      <h2>Available Doctors</h2>
      <ul className='d_list'>
        {doctors.map((doctor) => (
          <li className='list' key={doctor._id}>
            {doctor && doctor.photo && (
              <div>
                <img className='image' src={`data:image/png;base64,${doctor.photo}`} alt={doctor.name} />
              </div>
            )}
            <div>{doctor.name}</div>
            <div>{doctor.specialization}</div>
            <div>{doctor.degree}</div>
            <div>{doctor.hospital}</div>
            <div>Fees: Rs.{doctor.fees}</div>
            {/* Log doctorId before navigation */}
            <Link className='link' to={`/book-appointment/${doctor._id}`} >Book Appointment</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorList;
