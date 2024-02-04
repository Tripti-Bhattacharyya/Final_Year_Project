// App.js
// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom';
import Nav from './Nav/Nav';
import Homepage from './components/homepage/homepage';
import Login from './components/login/login';
import Register from './components/register/register';
import Hospitals from './components/hospitals/Hospitals';
import Doctors from './components/doctors/Doctors';
import './App.css';
import { useLocation } from 'react-router-dom';

// Define the main App component
function App() {
  // State to manage user authentication
  const [user, setLoginUser] = useState({});
  const [loading, setLoading] = useState(true);
 const location = useLocation();

  // Effect hook to check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Check if the current route is a protected route
      const isProtectedRoute = location.pathname === '/'||location.pathname === '/hospital' || location.pathname === '/doctors';

      // If it's a protected route, set the dummy user
      if (isProtectedRoute) {
        setLoginUser({ _id: 'someUserId' });
      } else {
        // If not a protected route, set user to null or an empty object
        setLoginUser(null); // or setLoginUser({});
      }
    } else {
      // No token found, set user to null or an empty object
      setLoginUser(null); // or setLoginUser({});
    }

    // Set loading to false after handling authentication logic
    setLoading(false);
  }, [location.pathname]); // Include location.pathname in dependency array to update on route change
  const handleLogout = () => {
    // Clear the token and set user to null
    localStorage.removeItem('token');
    setLoginUser(null);
  };
  if (loading) {
    return <p>Loading...</p>;
  } // Empty dependency array ensures the effect runs only once on mount

  // Render the main App component
  return (
    <div className="App">
    
        {/* Navigation component */}
        <Nav user={user} setLoginUser={setLoginUser} handleLogout={handleLogout} />
        {/* Define routes for different components */}
        <Routes>
          {/* Homepage route */}
          <Route
           
          
            path="/"
            element={
              <Homepage user={user} setLoginUser={setLoginUser} />
            }
          />

          {/* Login route */}
          <Route path="/login" element={<Login setLoginUser={setLoginUser} />} />

          {/* Register route */}
          <Route path="/register" element={<Register />} />

          {/* Hospitals route - Protected route, redirect to login if not authenticated */}
          <Route path="/hospital" element={user && user._id ? (<Hospitals/>) : (<Navigate to="/login" />)} />

          {/* Doctors route - Protected route, redirect to login if not authenticated */}
          <Route path="/doctors" element={user && user._id ? (<Doctors/>) : (<Navigate to="/login" />)} />
        </Routes>
      
    </div>
  );
}

// Export the App component
export default App;






