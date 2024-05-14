import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();
  
  // State to manage user registration data
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    reEnterPassword: "",
    isDoctor: false,
  });

  // State to manage redirection to doctor registration
  const [redirectToDoctorRegistration, setRedirectToDoctorRegistration] = useState(false);

  // Function to handle input change
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  // Function to handle registration
  const register = () => {
    const { name, email, password, reEnterPassword } = user;
    if (name && email && password && password === reEnterPassword) {
      axios
        .post("http://localhost:9002/register", user)
        .then((res) => {
          toast.success(res.data.message, {
            position: 'top-center',
            autoClose: 3000
          });
          navigate("/login");
        })
        .catch((error) => {
          console.error("Registration error:", error);
          toast.error("An error occurred during registration");
        });
    } else {
      toast.error("Invalid input", {
        position: 'top-center',
        autoClose: 3000
      });
    }
  };
  
  // Effect hook to handle redirection to doctor registration
  useEffect(() => {
    if (redirectToDoctorRegistration) {
      navigate("/register/doctor");
    }
  }, [redirectToDoctorRegistration, navigate]);

  return (
    <div className="register-wrapper">
    <div className="register-container">
      <h1 className="register-heading">Register</h1>
      
      <input
        type="text"
        className="register-input"
        name="name"
        value={user.name}
        placeholder="Your Name"
        onChange={handleUserChange}
      />
      
      <input
        type="text"
        className="register-input"
        name="email"
        value={user.email}
        placeholder="Your Email"
        onChange={handleUserChange}
      />
      
      <input
        type="password"
        className="register-input"
        name="password"
        value={user.password}
        placeholder="Your Password"
        onChange={handleUserChange}
      />
      
      <input
        type="password"
        className="register-input"
        name="reEnterPassword"
        value={user.reEnterPassword}
        placeholder="Re-enter Password"
        onChange={handleUserChange}
      />
      
      <label className="register-checkbox">
        Register as Doctor:
        <input
          type="checkbox"
          name="isDoctor"
          checked={user.isDoctor}
          onChange={(e) => {
            setUser({ ...user, isDoctor: e.target.checked });
            if (e.target.checked) {
              setRedirectToDoctorRegistration(true);
            }
          }}
        />
      </label>

      <div className="register-button" onClick={register}>
        Register
      </div>
      <div className="login-link">
        Already have an account? <a href="/login">Login</a>
      </div>
    </div>
    </div>
  );
};

export default Register;




