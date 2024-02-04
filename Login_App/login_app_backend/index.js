// Import necessary modules
// Import necessary modules
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add extended: true option
app.use(cors());

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
    password: String
});

const User = new mongoose.model("User", userSchema);

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, 'abcAgtjddz123', { expiresIn: '1h' });
};

// Login route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    let user;

    try {
        user = await User.findOne({ email });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                const token = generateToken(user._id);

                // Set an HTTP-only cookie with the token
                res.cookie('token', token, { httpOnly: true });

                res.send({ message: "Login Successful", user: { _id: user._id, email: user.email }, token });
            } else {
                res.send({ message: "Password didn't match" });
            }
        } else {
            res.send({ message: "User not registered" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred" });
    }
});

// Registration route
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.send({ message: "User already registered" });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                name,
                email,
                password: hashedPassword,
            });

            await newUser.save();

            const token = generateToken(newUser._id);

            // Set an HTTP-only cookie with the token
            res.cookie('token', token, { httpOnly: true });

            res.send({ message: "Successfully Registered, Please login now.", token });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred" });
    }
});

// Start the server
app.listen(9002, () => {
    console.log("BE started at port 9002");
});

