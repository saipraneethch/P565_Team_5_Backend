import mongoose from "mongoose";

// Define the schema for the Course model
const courseSchema = new mongoose.Schema({
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
    students: [{//array with two values
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
        },
        // grades are key-value pairs
        course_grades: {
            type: Map,
            of: Number, 
            default: {}, 
        },
    }],
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;
