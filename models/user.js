import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'Invalid email address'
        }
    },
    hashedPassword : {
        type: String,
        required: true
    }
})

const User = mongoose.model("user", userSchema);

export default User;