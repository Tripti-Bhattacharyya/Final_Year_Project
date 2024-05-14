import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import './Nav.css';

const Nav = ({ user, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false); // Close the nav menu when the user changes
  }, [user]);

  // Function to toggle the menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to close the menu when a link is clicked
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="Nav">
      <span className='nav-logo'>+MediConnect</span>

      <div className={`nav-items ${isOpen && "open"}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>

        
        {user && user._id ? (
          user.isDoctor ? (
            <>
              <Link to="/doctor-dashboard" onClick={closeMenu}>Doctor Dashboard</Link>
              <Link to={`/doctor-chat/${user._id}`} onClick={closeMenu}>Doctor Chat</Link>
            </>
          ) : (
            <>
              <Link to="/doctors" onClick={closeMenu}>Apply Doctors</Link>
              <Link to="/appointments" onClick={closeMenu}>Appointments</Link>
            </>
          )
        ) : null}

        {/* Render login/logout button */}
        {user && user._id ? (
          <div className="logout-button" onClick={handleLogout}>
            Logout
          </div>
        ) : (
          <Link className='navlogin-button' to="/login" onClick={closeMenu}>Login</Link>
        )}
      </div>

      <div
        className={`nav-toggle ${isOpen && "open"}`}
        onClick={toggleMenu}
      >
        <div className="bar"></div>
      </div>

    </div>
  );
};

export default Nav;





