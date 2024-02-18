import mongoose from "mongoose";
import bcrypt from "bcryptjs";
// const validator = require('validator');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'Please enter first name'],
    },
    last_name: {
        type: String,
        required: [true, 'Please enter last name'],
    },
    username: {
        type: String,
        required: [true, 'Please enter username'],
        unique:true
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        validate: {
            validator: function(value) {
                return emailRegex.test(value);
            },
            message: "Please enter a valid email",
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: 'user',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [{
        courseId: String,
    }],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next(); // If password is not modified, move on to the next middleware
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


//static login method
userSchema.statics.login = async function(username, password) {

    
    //validation
    if (!username || !password){
        throw Error('All fields must be required')
    }
    
    const user = await this.findOne( {username})
    console.log(user)

    if (!user ){
        throw Error('Incorrect username or username does not exist.')
    }
    
    const match = await bcrypt.compare(password, user.password)
    
    if (!match){
        throw Error("Incorrect password")
    }
    return user
}

const userModel = mongoose.model("User", userSchema);

export default userModel;
