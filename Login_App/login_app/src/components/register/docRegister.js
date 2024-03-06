import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DocRegister = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    degree: "",
    photo: null,
    isDoctor: true,
    timeslots: {
      monday: { start: "", end: "" },
      tuesday: { start: "", end: "" },
      // Add more days as needed
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("_start") || name.includes("_end")) {
      const [day, time] = name.split("_");
      setDoctor((prevDoctor) => ({
        ...prevDoctor,
        timeslots: {
          ...prevDoctor.timeslots,
          [day]: {
            ...prevDoctor.timeslots[day],
            [time]: value,
          },
        },
      }));
    } else {
      setDoctor((prevDoctor) => ({
        ...prevDoctor,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setDoctor((prevDoctor) => ({
      ...prevDoctor,
      photo: file,
    }));
  };

  const validateTimeslots = (timeslots) => {
    for (const day in timeslots) {
      if (!timeslots[day].start || !timeslots[day].end) {
        return false;
      }
    }
    return true;
  };

  const registerDoctor = async () => {
    const { name, email, password, specialization, degree, timeslots, photo } = doctor;

    // Check if any required field is empty
    if (!name || !email || !password || !specialization || !degree || !validateTimeslots(timeslots) || !photo) {
      alert("Please fill in all required fields and upload a photo");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("specialization", specialization);
      formData.append("degree", degree);
      formData.append("timeslots", JSON.stringify(timeslots));
      formData.append("photo", photo);

      const response = await axios.post("http://localhost:9002/register/doctor", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Doctor registration error:", error);
      alert("An error occurred during registration");
    }
  };

  return (
    <div className="doc-register">
      <h1>Doctor Registration</h1>
      <input type="text" name="name" value={doctor.name} placeholder="Your Name" onChange={handleChange} />
      <input type="text" name="email" value={doctor.email} placeholder="Your Email" onChange={handleChange} />
      <input type="password" name="password" value={doctor.password} placeholder="Your Password" onChange={handleChange} />
      <input type="text" name="specialization" value={doctor.specialization} placeholder="Your Specialization" onChange={handleChange} />
      <input type="text" name="degree" value={doctor.degree} placeholder="Your Degree" onChange={handleChange} />
      <input type="file" accept="image/*" onChange={handlePhotoChange} />

      {/* Timeslots selection */}
      <div>
        <label>Monday:</label>
        <select value={doctor.timeslots.monday.start} onChange={(e) => handleChange(e)} name="monday_start">
          <option value="">Select Start Time</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="1:00 PM">1:00 PM</option>
          {/* Add more options as needed */}
        </select>
        <select value={doctor.timeslots.monday.end} onChange={(e) => handleChange(e)} name="monday_end">
          <option value="">Select End Time</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
          {/* Add more options as needed */}
        </select>
      </div>
      <div>
        <label>Tuesday:</label>
        <select value={doctor.timeslots.tuesday.start} onChange={(e) => handleChange(e)} name="tuesday_start">
          <option value="">Select Start Time</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="1:00 PM">1:00 PM</option>
          {/* Add more options as needed */}
        </select>
        <select value={doctor.timeslots.tuesday.end} onChange={(e) => handleChange(e)} name="tuesday_end">
          <option value="">Select End Time</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
          {/* Add more options as needed */}
        </select>
      </div>
      {/* Add more days as needed */}
      
      <div className="button" onClick={registerDoctor}>
        Register as Doctor
      </div>
    </div>
  );
};

export default DocRegister;





