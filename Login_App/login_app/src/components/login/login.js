import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css';

const Login = ({ setLoginUser }) => {
  const history = useNavigate();

  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const login = async () => {
    try {
      const response = await axios.post("http://localhost:9002/login", user);
      const { message, user: loggedInUser, token } = response.data;

      if (message === "Login Successful") {
        // Save authentication state to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        // Update the user state
        setLoginUser(loggedInUser);

        // Redirect the user to the homepage
        history('/');
        toast.success("Login Successful");
      } else {
        // Display the error message as a toast
        toast.error(message);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <input type="text" name="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="Enter your Email" />
      <input type="password" name="password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} placeholder="Enter your Password" />
      <div className="button" onClick={login}>Login</div>
      <div>or</div>
      <div className="button" onClick={() => history('/register')}>Register</div>
    </div>
  );
};

export default Login;








