// Nav.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

const Nav = ({ user,handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false); // Close the nav menu when the user changes
  }, [user]);

  return (
    <div className="Nav">
      <span className='nav-logo'>Logo</span>

      <div className={`nav-items ${isOpen && "open"}`}>
        <Link to="/">Home</Link>
        <Link to="/hospital">Hospital</Link>
        <Link to="/doctors">Doctors</Link>
        <Link to="/patientsstories">Patients Stories</Link>
        <Link to="/contacts">Contacts</Link>

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
