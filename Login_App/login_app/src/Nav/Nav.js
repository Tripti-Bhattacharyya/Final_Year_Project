import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div className="Nav">
      <span className='nav-logo'>Logo</span>

      <div className={`nav-items ${isOpen && "open"}`}>
        <Link to="/">Home</Link>
        <Link to="/hospital" >Hospital</Link>
        <Link to="/doctors" >Doctors</Link>
        <Link to="/patientsstories">Patients Stories</Link>
        <Link to="/contacts">Contacts</Link>
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
