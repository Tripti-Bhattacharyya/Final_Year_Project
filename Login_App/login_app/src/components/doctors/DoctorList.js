// DoctorList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './DoctorList.css';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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

  // Function to handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Function to handle search submission
  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`http://localhost:9002/search-doctors?query=${searchQuery}`);
      setSearchResults(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error searching doctors:', error);
    }
  };

  return (
    <div>
      <h2>Available Doctors</h2>
      {/* Search form */}
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button type="submit">Search</button>
      </form>
      <ul className='d_list'>
        {(searchResults.length > 0 ? searchResults : doctors).map((doctor) => (
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

