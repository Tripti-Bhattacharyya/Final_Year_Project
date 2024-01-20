import express from "express"
import cors from "cors"
import mongoose from "mongoose"

const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/myLoginRegisterDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, ).then((res) => {
    console.log("Database connected");
  }).catch(error => {
     console.log(error);
})

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const User = new mongoose.model("User", userSchema)

//Routes
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email: email });

        if (user) {
            if (password === user.password) {
                res.send({ message: "Login Successful", user: user });
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


app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the user with the provided email already exists
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            res.send({ message: "User already registered" });
        } else {
            // Create a new user instance and save it to the database
            const newUser = new User({
                name,
                email,
                password,
            });

            await newUser.save(); // Use await here to ensure the user is saved before continuing

            res.send({ message: "Successfully Registered, Please login now." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred" });
    }
});


app.listen(9002,() => {
    console.log("BE started at port 9002")
})