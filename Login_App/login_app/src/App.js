// App.js
import React, { useState } from 'react';
import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';

import Nav from './Nav/Nav';
import Homepage from './components/homepage/homepage';
import Login from './components/login/login';
import Register from './components/register/register';
import Hospitals from './components/hospitals/Hospitals'; 
import Doctors from './components/doctors/Doctors';
import './App.css';
function App() {
  const [user, setLoginUser] = useState({});

  return (
    <div className="App">
      <Router>
      <Nav />
        <Routes>
          <Route
            exact
            path="/"
            element={
              user && user._id ? (
                <Homepage setLoginUser={setLoginUser} />
              ) : (
                <Login setLoginUser={setLoginUser} />
              )
            }
          />
          <Route path="/login" element={<Login setLoginUser={setLoginUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hospital" element={user && user._id ? (<Hospitals/>) : 
          (<Navigate to="/login" /> ) }/>
          <Route path="/doctors" element={user && user._id ? (<Doctors/>) : 
          (<Navigate to="/login" /> ) }/>

        </Routes>
      </Router>
    </div>
  );
}

export default App;


