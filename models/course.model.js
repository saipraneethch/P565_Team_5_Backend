import mongoose from "mongoose";

// Define the schema for the Course model
const courseSchema = new mongoose.Schema({
    courseID:{
        type: String,
        required: [true],
        unique: [true]
    },
    title: {
        type: String,
        required: [true, 'Please enter course title'],
    },
    description: {
        type: String,
        required: [true, 'Please enter course description'],
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;
