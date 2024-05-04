
// Import necessary modules
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Server } from "socket.io"; 
import http from "http";
import crypto from 'crypto';
import path from 'path'; 
import multer from "multer"; 
import axios from 'axios';
const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  }
});





app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add extended: true option


 
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
    hospital:String,
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
    status: { type: String, enum: ['Pending', 'Approved', 'Done','Paid'], default: 'Pending' } 
});

  
  const Appointment = mongoose.model('Appointment', appointmentSchema);


  const messageSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderId: { type: mongoose.Schema.Types.ObjectId },
    content: String, // For text messages
    fileName: String, // For non-text messages
    fileData: Buffer, // For non-text messages
    contentType: String, // For non-text messages
}, { timestamps: true });
const Message = mongoose.model('Message', messageSchema);

  
  const storage = multer.memoryStorage(); // Store file data in memory instead of on disk
  const upload = multer({ storage: storage });
// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, 'abcAgtjddz123', { expiresIn: '1h' });
};

//chat
// WebSocket connection handling
// Example endpoint for serving files
app.get('/files/:messageId', async (req, res) => {
    const { messageId } = req.params;

    try {
        // Find the message by its ID
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).send('Message not found');
        }

        // Set appropriate content type header
        res.setHeader('Content-Type', message.contentType);

        // Send the file data stored in the message buffer
        res.send(message.fileData);
    } catch (error) {
        console.error('Error retrieving file from database:', error);
        res.status(500).send('Internal server error');
    }
});


io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Event listener for getUsers

    socket.on('getUsers', async (doctorId) => {
        try {
            const userIds = await Message.distinct('userId', { doctorId });  // Get distinct user IDs who sent messages
            console.log(userIds); // Add this line to check the value of userIds
    
            // Filter out any non-string values and ensure they are valid ObjectId strings
           
    
            // Fetch user details for valid IDs
            const users = await User.find({ _id: userIds }, 'name'); // Fetch user details for those IDs
            console.log(users);
            socket.emit('users', users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    });


  
    // Event listener for getMessages
// Event listener for getMessages
socket.on('getMessages', async ({ userId, doctorId }) => {
    try {
      const messages = await Message.find({ userId, doctorId }).sort({ createdAt: 'asc' }).exec();
      // Convert fileData to base64 before sending
      const messagesWithBase64 = messages.map(message => {
        if (message.fileData) {
          return {
            ...message.toObject(),
            fileData: message.fileData.toString('base64') // Convert Buffer to base64 string
          };
        } else {
          return message;
        }
      });
      socket.emit('messages', messagesWithBase64);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  });
  


socket.on('sendMessage', async (formData) => {
    try {
        // Extract data from formData
        const { userId, doctorId, content, file } = formData;

        // Determine senderId based on the sender
        const senderId = userId === socket.handshake.query.userId ? userId : doctorId;

        let message;
        if (content) {
            message = new Message({ userId, doctorId, content, senderId });
        } else if (file) {
            const fileName = file.name;
            const fileData = file.data;
            const contentType = file.contentType;
            const fileExtension = path.extname(fileName).toLowerCase(); // Get file extension
            message = new Message({ userId, doctorId, senderId, fileName, fileData, contentType, fileExtension });
        }

        if (message) {
            await message.save();
            // Convert fileData to base64 before emitting
            const messageWithBase64 = message.fileData ? {
                ...message.toObject(),
                fileData: message.fileData.toString('base64') // Convert Buffer to base64 string
            } : message;
            socket.emit('message', messageWithBase64);
            console.log("Message emitted:", message);
        } else {
            console.error('No content or file provided.');
        }
    } catch (error) {
        console.error('Error saving message:', error);
    }
});

  
  
    // Disconnect event
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });


// Add route to fetch list of users who sent messages to the doctor
app.get('chat/:doctorId/:userId', async (req, res) => {
    try {
        const { doctorId, userId } = req.params;
        // Fetch chat history between the doctor and the selected user from the database
        const messages = await Message.find({ doctorId, userId }).sort({ createdAt: 'asc' });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//==============>


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
        const { name, email, password, degree,hospital,fees, specialization, timeslots,razorpayLink } = req.body;
        const photoData = req.file.buffer;

        // Check if all required fields are provided
        if (!name || !email || !password || !degree||!hospital || !specialization ||!razorpayLink|| !timeslots || !photoData || !fees) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: "Doctor with this email already exists" });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new doctor instance
        const newDoctor = new Doctor({
            name,
            email,
            password: hashedPassword,
            degree,
            hospital,
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

        // Check if the requested time slot is available for the doctor
        const existingAppointments = await Appointment.find({ doctorId, date: selectedDate, timeSlot: selectedTimeSlot });
        if (existingAppointments.length > 0) {
            return res.status(400).json({ message: 'The selected time slot is already booked' });
        }

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
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'An error occurred while booking the appointment' });
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


app.get('/check-appointment/:doctorId/:userId', authenticateUser, async (req, res) => {
    try {
        const { doctorId, userId } = req.params;
        
        // Fetch any existing appointment details from the database based on the provided doctor ID and user ID
        const appointment = await Appointment.findOne({ doctorId, userId });

        // Check if appointment exists
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found for this doctor and user" });
        }

        // If appointment exists, check if it's active
        if (appointment.status !== 'Done' && appointment.status !== 'Cancelled') {
            // If appointment is not completed or cancelled, it's considered active
            return res.json(appointment);
        }

        // If appointment is completed or cancelled, it's not considered active
        return res.status(404).json({ message: "Active appointment not found for this doctor and user" });

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

app.get('/search-doctors', async (req, res) => {
    try {
        const { query } = req.query;

        // Search for doctors matching the query
        const doctors = await Doctor.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { hospital: { $regex: query, $options: 'i' } },
                { specialization: { $regex: query, $options: 'i' } }
            ]
        });

        // Convert photo Buffers to Base64 strings
        const doctorsWithBase64Photos = doctors.map(doctor => {
            if (doctor.photo && doctor.photo.data) {
                const base64Photo = doctor.photo.data.toString('base64');
                return { ...doctor.toObject(), photo: base64Photo };
            }
            return doctor.toObject();
        });

        res.json(doctorsWithBase64Photos);
    } catch (error) {
        console.error('Error searching doctors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Backend route to update appointment status after payment
app.put('/appointments/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Check if the provided status is a valid appointment status
        const validStatuses = ['Pending', 'Approved', 'Done',  'Paid'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid appointment status' });
        }

        // Find the appointment by ID
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update the appointment status
        appointment.status = status;
        await appointment.save();

        res.json({ message: 'Appointment status updated successfully', appointment });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Function to verify Razorpay webhook signature

const verifyWebhookSignature = (payload, signature, secret) => {
    const generatedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return generatedSignature === signature;
};

// Function to capture payment
const capturePayment = async (paymentId, amount, appointmentId) => {
    try {
        const response = await axios.post(
            `https://api.razorpay.com/v1/payments/${paymentId}/capture?amount=${amount}`,
            {}, // Empty request body
            {
                auth: {
                    username: 'rzp_test_X50Ftg7u2gTNyg',
                    password: 'hoESSHePnv6b0u5uJ2w7RmPR'
                }
            }
        );

        const captureDetails = response.data;
        console.log('Payment captured successfully:', captureDetails);

        // Update appointment status to 'Paid'
        await Appointment.findByIdAndUpdate(appointmentId, { status: 'Paid' });

        return captureDetails;
    } catch (error) {
        console.error('Error capturing payment:', error.response.data);
        throw error;
    }
};

// Route to handle Razorpay webhook notifications
app.post('/webhook', async (req, res) => {
    const webhookSecret = 'Tripti@2024';

    const payload = JSON.stringify(req.body);
    const signature = req.get('x-razorpay-signature');

    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
        return res.status(400).send('Invalid webhook signature');
    }

    // Payment successful, get payment details from Razorpay
    const paymentId = req.body.payload.payment.entity.id;
    console.log("Payment:", paymentId);
    console.log("Request Body:", req.body);

    try {
        const response = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
            auth: {
                username: 'rzp_test_X50Ftg7u2gTNyg', // Replace with your actual API key ID
                password: 'hoESSHePnv6b0u5uJ2w7RmPR' // Replace with your actual API key secret
            }
        });

        const paymentDetails = response.data;
        if (paymentDetails.status === 'captured') {
            // If payment is already captured, update appointment status to 'Paid'
            const appointmentId = req.body.payload.payment.entity.notes.appointmentId;
          // await Appointment.findByIdAndUpdate(appointmentId, { status: 'Paid' });

            return res.status(200).send('Appointment status updated to Paid');
        } else if (paymentDetails.status === 'authorized') {
            // If payment is authorized, capture it and update appointment status to 'Paid'
            const appointmentId = req.body.payload.payment.entity.notes.appointmentId;
            const appointment = await Appointment.findById(appointmentId);
            const doctorId = appointment.doctorId;
            const doctor = await Doctor.findById(doctorId);

            await capturePayment(paymentId, doctor.fees * 100, appointmentId);
            await transferPaymentToDoctor(doctor.fees * 100, doctorId,appointmentId);
            return res.status(200).send('Payment captured and appointment status updated to Paid');
        } else {
            return res.status(200).send('Payment status not captured');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).send('Error processing payment');
    }
});
const transferPaymentToDoctor = async (amount, doctorId, appointmentId) => {
    try {
        // Get doctor's Razorpay link from the database based on doctorId
        const doctor = await Doctor.findById(doctorId);
        const razorpayLink = doctor.razorpayLink;
        console.log(razorpayLink);
        // Transfer payment to doctor's account using doctor's Razorpay link
        const transferResponse = await transferPayment(amount, razorpayLink, appointmentId);
        
        // Handle the transfer response
        if (transferResponse.success) {
            // Payment transfer successful, update appointment status to 'Paid' in the database
            await Appointment.findByIdAndUpdate(appointmentId, { status: 'Paid' });
            console.log('Payment transferred successfully to doctor:', transferResponse.transactionId);
        } else {
            // Payment transfer failed, handle the error
            console.error('Payment transfer failed:', transferResponse.error);
            throw new Error('Payment transfer failed');
        }
    } catch (error) {
        console.error('Error transferring payment to doctor:', error);
        // Handle the error accordingly
        throw error;
    }
};
const transferPayment = async (amount, razorpayLink, appointmentId) => {
    try {
        // Make API call to transfer payment to doctor's account using Razorpay link
        const response = await axios.post(
            razorpayLink, // Doctor's Razorpay link
            {
                amount: amount, 
                currency: 'INR',
                notes: {
                    appointmentId: appointmentId // Add any additional parameters as needed
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const transferDetails = response.data;
        console.log('Payment transferred successfully:', transferDetails);

        // Return success response
        return {
            success: true,
            transactionId: transferDetails.id
        };
    } catch (error) {
        console.error('Error transferring payment:', error.response.data);
        throw new Error('Error transferring payment');
    }
};



// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 9002;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});














