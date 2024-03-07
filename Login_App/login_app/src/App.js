
import React, { useState, useEffect } from 'react';

import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';
import Nav from './Nav/Nav';
import Homepage from './components/homepage/homepage';
import Login from './components/login/login';
import Register from './components/register/register';
import DocRegister from './components/register/docRegister';
import Hospitals from './components/hospitals/Hospitals';
import DoctorDashboard from './components/doctors/DoctorDashboard';
import DoctorList from './components/doctors/DoctorList';
import Booking from './components/booking';
import './App.css';
import { useLocation } from 'react-router-dom';

function App() {
  const [user, setLoginUser] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLoginUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user'); // Remove invalid data from localStorage
        setLoginUser({}); // Set an empty user object
      }
    }

    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoginUser({});
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="App">
      <Nav user={user} setLoginUser={setLoginUser} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Homepage user={user} setLoginUser={setLoginUser} />} />
        <Route path="/login" element={<Login setLoginUser={setLoginUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/doctor" element={<DocRegister />} />
        <Route path="/hospital" element={user._id ? (<Hospitals />) : (<Navigate to="/login" />)} />
        <Route path="/doctors" element={user._id ? (<DoctorList />) : (<Navigate to="/login" />)} />
        <Route path="/doctor-dashboard" element={user._id && user.isDoctor ? (<DoctorDashboard />) : (<Navigate to="/login" />)} />
        <Route path="/book-appointment/:doctorId" element={user._id ? (<Booking user={user} />) : (<Navigate to="/login" />)} />
       
      </Routes>
    </div>
  );
}

export default App;
















