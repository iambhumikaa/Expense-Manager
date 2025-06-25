import User from '../models/user.js';
import Expense from '../models/expense.js'
import Income from '../models/income.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from "dotenv";

env.config();

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const secret = process.env.JWT_SECRET;
const tokenExpiry = '1h';

export const renderSignupPage = (req, res) => {
    try {
        res.render("signup");
    } catch (error) {
        console.error('Fetching error:', error);
        res.status(500).send("Error fetching file.");
    }
}

export const createUser = async (req, res) => {
    try {
        const { userName, userEmail, password } = req.body;
        const existingUser = await User.findOne({ userEmail });
        if (existingUser) {
            return res.status(409).send("User with this email already exists.");
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ userName, userEmail, hashedPassword });
        await newUser.save();

        res.render("login");

    } catch (error) {
        console.error(error);
        res.status(500).send("Error signing up user.");
    }
}

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).send('User not found.');
        }
        res.send('User deleted successfully!');

    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting user.");
    }
}

export const renderLoginPage = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.error('Fetching error:', error);
        res.status(500).send("Error fetching file.");
    }
}

export const loginUser = async (req, res) => {
    try {
        const { userEmail, password } = req.body;
        // console.log("BODY:", userEmail, password);
        const user = await User.findOne({ userEmail });
        // console.log("User found:", user.userEmail);

        if (!user) {
            return res.status(401).send('Invalid email.');
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!isMatch) {
            return res.status(401).send('Invalid Password.');
        }

        //Creating user token for browser
        const token = jwt.sign(
            { id: user._id, email: user.userEmail },
            secret,
            { expiresIn: tokenExpiry }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000
        });

        //Redirecting to dashboard router
        return res.redirect("/dashboard");
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(404).send('User not registered.');
    }
}

export const logoutUser = async (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
}