
// Import necessary modules
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import multer from "multer"; 
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add extended: true option
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true 
  }));
  

// MongoDB connection setup
mongoose.connect("mongodb://127.0.0.1:27017/myLoginRegisterDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((res) => {
    console.log("Database connected");
}).catch(error => {
    console.log(error);
});


// User schema and model setup
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isDoctor: { type: Boolean, default: false } // New field to indicate if user is a doctor
});

const User = new mongoose.model("User", userSchema);
const doctorSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    specialization: String,
    degree: String,
    photo: Buffer, // Store photo data as binary
    timeslots: {
      monday: { start: String, end: String }
    },
    isDoctor: { type: Boolean, default: true }
});
  
const Doctor = mongoose.model('Doctor', doctorSchema);

const appointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    timeSlot: String,
    status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' }
  });
  
  const Appointment = mongoose.model('Appointment', appointmentSchema);
  
  const storage = multer.memoryStorage(); // Store file data in memory instead of on disk
  const upload = multer({ storage: storage });
// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, 'abcAgtjddz123', { expiresIn: '1h' });
};


// Login route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists in the User collection
        const user = await User.findOne({ email });

        if (user) {
            try {
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (passwordMatch) {
                    const token = generateToken(user._id);
                    res.cookie('token', token, { httpOnly: true });
                    res.send({ message: "Login Successful", user: { _id: user._id, email: user.email, isDoctor: false }, token });
                    return;
                } else {
                    res.send({ message: "Password didn't match" });
                    return;
                }
            } catch (error) {
                console.error("Error comparing passwords:", error);
                res.status(500).send({ message: "An error occurred" });
                return;
            }
        }

        // Check if the user exists in the Doctor collection
        const doctor = await Doctor.findOne({ email });

        if (doctor) {
            // console.log("Doctor found:", doctor);
            // console.log("Doctor password:", doctor.password);

            // Ensure that doctor.password is a hashed password before comparing
            try {
                const passwordMatch = await bcrypt.compare(password, doctor.password);

                if (passwordMatch) {
                    const token = generateToken(doctor._id);
                    res.cookie('token', token, { httpOnly: true });
                    res.send({ message: "Login Successful", user: { _id: doctor._id, email: doctor.email, isDoctor: true }, token });
                    return;
                } else {
                    res.send({ message: "Password didn't match" });
                    return;
                }
            } catch (error) {
                console.error("Error comparing passwords:", error);
                res.status(500).send({ message: "An error occurred" });
                return;
            }
        }

        res.send({ message: "User not registered" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred" });
    }
});


// Registration route for regular users
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
    
        if (existingUser) {
            return res.send({ message: "User already registered" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        // Save the new user to the database
        await newUser.save();

        const token = generateToken(newUser._id);

        // Set an HTTP-only cookie with the token
        res.cookie('token', token, { httpOnly: true });

        // Send response
        res.send({ message: "Successfully Registered, Please login now.", token });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred" });
    }
});


// Registration route for doctors
app.post("/register/doctor", upload.single('photo'), async (req, res) => {
    try {
        // Extract fields from request body
        const { name, email, password, degree, specialization, timeslots } = req.body;
        const photoData = req.file.buffer; // Get photo data from memory buffer

        // Check if all required fields are provided
        if (!name || !email || !password || !degree || !specialization || !timeslots || !photoData) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new doctor instance
        const newDoctor = new Doctor({
            name,
            email,
            password: hashedPassword,
            degree,
            specialization,
            photo: photoData, // Save photo data
            timeslots,
        });

        // Save the new doctor to the database
        await newDoctor.save();

        const token = generateToken(newDoctor._id);

        // Set an HTTP-only cookie with the token
        res.cookie('token', token, { httpOnly: true });

        // Send response
        res.status(201).json({ message: "Successfully Registered as a doctor, Please login now.", token });
    } catch (error) {
        console.error("Error registering doctor:", error);
        res.status(500).json({ message: "An error occurred" });
    }
});


app.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'name email');

        // Map through doctors and convert photo data to base64 string
        const formattedDoctors = doctors.map(doctor => {
            const formattedDoctor = doctor.toObject(); // Convert Mongoose document to plain JavaScript object

            // Check if photo property is defined before converting to base64
            if (formattedDoctor.photo) {
                formattedDoctor.photo = formattedDoctor.photo.toString('base64');
            }

            return formattedDoctor;
        });

        // Send formatted doctors data
        res.json(formattedDoctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.get('/doctor-dashboard', async (req, res) => {
    try {
      const doctorId = req.user._id; // Assuming doctor's identity is available after authentication
  
      // Retrieve appointments for the doctor
      const doctorAppointments = await Appointment.find({ doctorId }).populate('userId');
      res.json(doctorAppointments);
    } catch (error) {
      console.error('Error fetching doctor dashboard data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

app.post('/book-appointment/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        console.log('Doctor ID:', doctorId);
        const { selectedDate, selectedTimeSlot } = req.body;
     
      // Create a new appointment
      const appointment = new Appointment({
        doctorId,
        userId: req.user._id, // Assuming userId is available after authentication
        date: selectedDate,
        timeSlot: selectedTimeSlot
      });
      await appointment.save();
  
      res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (error) {
      console.error('Error booking appointment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

// Start the server
app.listen(9002, () => {
    console.log("BE started at port 9002");
});




