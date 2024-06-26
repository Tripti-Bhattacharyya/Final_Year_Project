import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Nav from './Nav/Nav';
import Homepage from './components/homepage/homepage';
import Login from './components/login/login';
import Register from './components/register/register';
import DocRegister from './components/register/docRegister';
import DoctorDashboard from './components/doctors/DoctorDashboard';
import DoctorList from './components/doctors/DoctorList';
import Booking from './components/booking';
import Appointments from './components/appointments/Appointments';
import DoctorChat from './components/Chat/DoctorChat';
import UserChat from './components/Chat/UserChat';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [user, setLoginUser] = useState({});
  const [loading, setLoading] = useState(true);
  

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
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Homepage user={user} setLoginUser={setLoginUser} />} />
        <Route path="/login" element={<Login setLoginUser={setLoginUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/doctor" element={<DocRegister />} />
        <Route path="/doctors" element={user._id ? (<DoctorList />) : (<Navigate to="/login" />)} />
        <Route path="/doctor-dashboard" element={user._id && user.isDoctor ? (<DoctorDashboard />) : (<Navigate to="/login" />)} />
        <Route path="/book-appointment/:doctorId" element={user._id ? (<Booking user={user} />) : (<Navigate to="/login" />)} />
        <Route path="/appointments" element={user._id ? (<Appointments user={user} />) : (<Navigate to="/login" />)} />
        <Route path="/doctor-chat/:doctorId" element={user._id && user.isDoctor ? (<DoctorChat doctorId={user._id}/>) : (<Navigate to="/login" />)} />
        <Route path="/chat/:doctorId/:userId" element={user._id ?(<UserChat user={user._id}/>): (<Navigate to="/login" />)} />
      </Routes>
    </div>
  );
}

export default App;


















