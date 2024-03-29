// Nav.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import './Nav.css';

const Nav = ({ user, handleLogout }) => {
  
  const [isOpen, setIsOpen] = useState(false);
 
  useEffect(() => {
    setIsOpen(false); // Close the nav menu when the user changes
  }, [user]);
  console.log('User object:', user);
  return (
    <div className="Nav">
      <span className='nav-logo'>+Medicare</span>
      
      <div className={`nav-items ${isOpen && "open"}`}>
        <Link to="/">Home</Link>
        
        
        {/* Render different links based on user type */}
        {user && user._id ? (
          user.isDoctor ? ( // Check if user is a doctor
            <Link to="/doctor-dashboard">Doctor Dashboard</Link>
          ) : (
            <>
            <Link to="/doctors">Apply Doctors</Link>
            <Link to="/appointments">Appointments</Link>
            </>
          )
        ) : null}

        {/* Render login/logout button */}
        {user && user._id ? (
          <div className="logout-button" onClick={handleLogout}>
            Logout
          </div>
        ) : (
          <Link className='button' to="/login">Login</Link>
        )}
      </div>

      <div
        className={`nav-toggle ${isOpen && "open"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="bar"></div>
      </div>
    </div>
  );
};

export default Nav;



