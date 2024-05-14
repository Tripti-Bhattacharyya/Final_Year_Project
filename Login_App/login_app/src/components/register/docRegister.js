import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './docRegister.css'
const DocRegister = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    degree: "",
    hospital:"",
    fees: "", 
    razorpayLink: "", 
   
    photo: null,
    isDoctor: true,
    timeslots: {
      monday: { start: "", end: "" },
      tuesday: { start: "", end: "" },
      
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
    const { name, email, password, specialization, degree, fees, razorpayLink, timeslots, photo, hospital } = doctor;
  
    // Check if any required field is empty
    if (!name || !email || !password || !specialization || !degree || !fees || !razorpayLink || !validateTimeslots(timeslots) || !photo || !hospital) {
      toast.error("Please fill in all required fields and upload a photo", {
        position: 'top-center',
        autoClose: 3000
      });
      return;
    }
  
    try {
      const existingDoctor = await axios.get(`http://localhost:9002/doctors?email=${email}`);
      if (existingDoctor.data === email) {
        toast.error("Doctor with this email already exists", {
          position: 'top-center',
          autoClose: 3000
        });
        return;
      }
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("specialization", specialization);
      formData.append("degree", degree);
      formData.append("hospital", hospital);
      formData.append("fees", fees);
      formData.append("razorpayLink", razorpayLink);
  
      formData.append("timeslots", JSON.stringify(timeslots));
      formData.append("photo", photo);
  
      const response = await axios.post("http://localhost:9002/register/doctor", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      toast.success(response.data.message, {
        position: 'top-center',
        autoClose: 3000
      });
      navigate("/login");
    } catch (error) {
      console.error("Doctor registration error:", error);
      toast.error("An error occurred during registration");
    }
  };
  

  return (
    <div className="docregister-wrapper">
    <div className="doc-register">
      <h1 className="register-heading">Doctor Registration</h1>
      <input className="input-field" type="text" name="name" value={doctor.name} placeholder="Your Name" onChange={handleChange} />
      <input className="input-field" type="text" name="email" value={doctor.email} placeholder="Your Email" onChange={handleChange} />
      <input className="input-field" type="password" name="password" value={doctor.password} placeholder="Your Password" onChange={handleChange} />
      <input className="input-field" type="text" name="specialization" value={doctor.specialization} placeholder="Your Specialization" onChange={handleChange} />
      <input className="input-field" type="text" name="degree" value={doctor.degree} placeholder="Your Degree" onChange={handleChange} />
      <input className="input-field" type="text" name="hospital" value={doctor.hospital} placeholder="Your Hospital" onChange={handleChange} />
      <input className="input-field" type="text" name="fees" value={doctor.fees} placeholder="Consultation Fee" onChange={handleChange} />
      <input className="input-field"  type="text" name="razorpayLink" value={doctor.razorpayLink} placeholder="Your Razorpay Link" onChange={handleChange} /> 
      
      <input className="input-field" type="file" accept="image/*" onChange={handlePhotoChange} />

      
      <div className="time-slots">
        <div className="day-slot">
        <label>Monday:</label>
        <select value={doctor.timeslots.monday.start} onChange={(e) => handleChange(e)} name="monday_start">
          <option value="">Select Start Time</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="1:00 PM">1:00 PM</option>
         
        </select>
        <select value={doctor.timeslots.monday.end} onChange={(e) => handleChange(e)} name="monday_end">
          <option value="">Select End Time</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
         
        </select>
      </div>
      <div className="day-slot">
        <label>Tuesday:</label>
        <select value={doctor.timeslots.tuesday.start} onChange={(e) => handleChange(e)} name="tuesday_start">
          <option value="">Select Start Time</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="1:00 PM">1:00 PM</option>
         
        </select>
        <select value={doctor.timeslots.tuesday.end} onChange={(e) => handleChange(e)} name="tuesday_end">
          <option value="">Select End Time</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
       
        </select>
      </div>
      <div className="day-slot">
        <label>Wednesday:</label>
        <select value={doctor.timeslots.tuesday.start} onChange={(e) => handleChange(e)} name="tuesday_start">
          <option value="">Select Start Time</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="1:00 PM">1:00 PM</option>
         
        </select>
        <select value={doctor.timeslots.tuesday.end} onChange={(e) => handleChange(e)} name="tuesday_end">
          <option value="">Select End Time</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
       
        </select>
      </div>
      <div className="day-slot">
        <label>Thursday:</label>
        <select value={doctor.timeslots.tuesday.start} onChange={(e) => handleChange(e)} name="tuesday_start">
          <option value="">Select Start Time</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="1:00 PM">1:00 PM</option>
         
        </select>
        <select value={doctor.timeslots.tuesday.end} onChange={(e) => handleChange(e)} name="tuesday_end">
          <option value="">Select End Time</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
       
        </select>
      </div>
      <div className="day-slot">
        <label>Friday:</label>
        <select value={doctor.timeslots.tuesday.start} onChange={(e) => handleChange(e)} name="tuesday_start">
          <option value="">Select Start Time</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="1:00 PM">1:00 PM</option>
         
        </select>
        <select value={doctor.timeslots.tuesday.end} onChange={(e) => handleChange(e)} name="tuesday_end">
          <option value="">Select End Time</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
       
        </select>
      </div>
      <div className="day-slot">
        <label>Saturday:</label>
        <select value={doctor.timeslots.tuesday.start} onChange={(e) => handleChange(e)} name="tuesday_start">
          <option value="">Select Start Time</option>
          <option value="9:00 AM">9:00 AM</option>
          <option value="1:00 PM">1:00 PM</option>
         
        </select>
        <select value={doctor.timeslots.tuesday.end} onChange={(e) => handleChange(e)} name="tuesday_end">
          <option value="">Select End Time</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="5:00 PM">5:00 PM</option>
       
        </select>
      </div>
  
 </div>
      
      <div className="doc-button" onClick={registerDoctor}>
        Register as Doctor
      </div>
    </div>
    </div>
  );
};

export default DocRegister;








