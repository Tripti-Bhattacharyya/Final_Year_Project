import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import axios from "axios";

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
    const { name, email, password, reEnterPassword } = user
    if (name && email && password && (password === reEnterPassword)) {
      axios.post("http://localhost:9002/register", user)
        .then( res => {
          alert(res.data.message)
          navigate("/login")
        })
        .catch(error => {
          console.error("Registration error:", error);
          alert("An error occurred during registration");
        });
    } else {
      alert("Invalid input");
    }
  };

  // Effect hook to handle redirection to doctor registration
  useEffect(() => {
    if (redirectToDoctorRegistration) {
      navigate("/register/doctor");
    }
  }, [redirectToDoctorRegistration, navigate]);

  return (
    <div className="register">
      <h1>Register</h1>
      {/* Input fields for user registration */}
      <input
        type="text"
        name="name"
        value={user.name}
        placeholder="Your Name"
        onChange={handleUserChange}
      />
      
      <input
        type="text"
      name="email"
      value={user.email}
        placeholder="Your Email"
     onChange={handleUserChange}
       />
         <input
        type="password"
         name="password"
       value={user.password}
       placeholder="Your Password"
       onChange={handleUserChange}
       />
     <input
      type="password"
      name="reEnterPassword"
      value={user.reEnterPassword}
      placeholder="Re-enter Password"
       onChange={handleUserChange}
      />
      
      <label>
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

      <div className="button" onClick={register}>
        Register
      </div>
      <div>or</div>
      <div className="button" onClick={() => navigate("/login")}>
        Login
      </div>
    </div>
  );
};

export default Register;




