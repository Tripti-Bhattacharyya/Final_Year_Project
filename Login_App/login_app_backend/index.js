
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
const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Authorization token not provided" });
    }

    try {
        const decoded = jwt.verify(token, 'abcAgtjddz123');
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(403).json({ message: "Invalid token" });
    }
};

// Define error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
};

// Define multer storage for file upload


// User schema and model setup
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isDoctor: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);
const doctorSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    specialization: String,
    degree: String,
    fees: Number,
    photo: Buffer, // Store photo data as binary
    timeslots: {
        monday: { start: String, end: String }
    },
    razorpayLink: String, // Add Razorpay link field
    isDoctor: { type: Boolean, default: true }
});

const Doctor = mongoose.model('Doctor', doctorSchema);


const appointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    timeSlot: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Done'], default: 'Pending' } 
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
        const { name, email, password, degree,fees, specialization, timeslots,razorpayLink } = req.body;
        const photoData = req.file.buffer;

        // Check if all required fields are provided
        if (!name || !email || !password || !degree || !specialization ||!razorpayLink|| !timeslots || !photoData || !fees) {
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
            fees: parseFloat(fees), // Convert fees to number
            specialization,
            razorpayLink,
            photo: photoData,
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



// Add route to fetch doctor's appointments
// Doctor dashboard route
app.get('/doctor-dashboard', authenticateUser, async (req, res) => {
    try {
        const doctorId = req.user.userId;
        // Fetch appointments for the authenticated doctor
        const doctorAppointments = await Appointment.find({ doctorId }).populate('userId');
        res.json(doctorAppointments);
    } catch (error) {
        next(error);
    }
});

// Route to approve appointment
app.put('/appointments/:id/approve', authenticateUser, async (req, res) => {
    try {
        const appointmentId = req.params.id;
        // Update appointment status to 'Approved'
        await Appointment.findByIdAndUpdate(appointmentId, { status: 'Approved' });
        res.json({ message: 'Appointment approved successfully' });
    } catch (error) {
        next(error);
    }
});

// Route to book appointment
app.post('/book-appointment/:doctorId', authenticateUser, async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { selectedDate, selectedTimeSlot } = req.body;

        // Create a new appointment
        const appointment = new Appointment({
            doctorId,
            userId: req.user.userId,
            date: selectedDate,
            timeSlot: selectedTimeSlot
        });
        await appointment.save();

        res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (error) {
        next(error);
    }
});


// Route to mark appointment as done
app.delete('/appointments/:id/done', authenticateUser, async (req, res) => {
    try {
        const appointmentId = req.params.id;
        
        // Find the appointment by ID
        const appointment = await Appointment.findById(appointmentId);
    
        // Check if the appointment exists
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
    
        // Delete the appointment from the database
        await Appointment.findByIdAndDelete(appointmentId);
    
        res.json({ message: 'Appointment marked as done and deleted successfully' });
    } catch (error) {
        console.error('Error marking appointment as done:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


  // Add route to check appointment status
  app.get('/check-appointment/:doctorId', authenticateUser, async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        // Fetch appointment details from the database based on the provided doctor ID and user ID
        const appointments = await Appointment.find({ doctorId });

        // Check if appointments exist
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No appointments found for this doctor" });
        }

        // If appointments exist, return the appointment details
        res.json(appointments);
    } catch (error) {
        console.error('Error checking appointment status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Add route to fetch appointments with populated doctor details
app.get('/appointments/:userId', authenticateUser, async (req, res) => {
    try {
        const userId = req.params.userId;
        // Fetch appointments for the authenticated user and populate doctor details
        const appointments = await Appointment.find({ userId }).populate('doctorId', 'name');
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Backend route to handle appointment cancellation
app.delete('/cancel-appointment/:id', async (req, res) => {
    try {
      const appointmentId = req.params.id;
      // Find the appointment by ID and delete it from the database
      const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);
      if (!deletedAppointment) {
        return res.status(404).send('Appointment not found');
      }
      res.status(200).send('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).send('Error cancelling appointment');
    }
  });
  
// Route to create payment intent


app.get('/doctors/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        res.status(500).json({ message: 'An error occurred while fetching doctor details' });
    }
});


// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(9002, () => {
    console.log("Backend server started at port 9002");
});




