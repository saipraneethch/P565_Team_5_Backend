import express from "express";
import userModel from "../models/user.model.js";
import courseModel from "../models/course.model.js"; // Import the Grade model
import ErrorHandler from "../utils/errorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import mongoose from "mongoose";


//get all courses
export const getCourses = async (req, res) => {
    
  const courses = await courseModel.find().sort({code: 1});
  res.status(200).json(courses);
}

//get a single course
export const getCourse = async (req, res) => {
  const {id} = req.params

  if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(404).json({error: 'No such course'})
  }

  const course = await courseModel.findById(id)

  if (!course) {
      return res.status(404).json({error: "No such course"})
  }

  res.status(200).json(course)
}

export const addCourse = async (req, res) => {
  const { code, title, description, category, instructor, start_date, end_date, bibliography } = req.body;


  let emptyFields = [];
  if (!code) emptyFields.push('code');
  if (!title) emptyFields.push('title');
  if (!description) emptyFields.push('description');
  if (!category) emptyFields.push('category');
  if (!instructor) emptyFields.push('instructor');
  if (!start_date) emptyFields.push('start_date');
  if (!end_date) emptyFields.push('end_date');

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: "Please fill in all the fields.", emptyFields });
  }

  // Validate the instructor ObjectId
  if (!mongoose.Types.ObjectId.isValid(instructor)) {
    return res.status(400).json({ error: 'Invalid instructor ID' });
  }

  // Check if instructor exists
  const instructorExists = await userModel.findById(instructor);
  if (!instructorExists) {
    return res.status(404).json({ error: 'Instructor not found' });
  }

  // Find the user by their username
  const course_code = await courseModel.findOne({ code: code.toUpperCase() }); 

  if (course_code) {
      return res.status(409).json({ error: "Course code already exists." }); 
  }
  
  try {
    // Convert comma-separated strings to arrays if necessary
    const parsedCategory = typeof category === 'string' ? category.split(',') : category;
    const parsedBibliography = typeof bibliography === 'string' ? bibliography.split(',').map(item => {
      const [title, author] = item.split(';').map(part => part.trim());
      return { title, author };
    }) : bibliography;

    const course = await courseModel.create({
      code,
      title,
      description,
      category: parsedCategory,
      instructor,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      bibliography: parsedBibliography
    });

    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//delete a user
export const deleteCourse = async (req, res) => {
  const {id} = req.params

  if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(404).json({error: 'No such course'})
  }

  const course = await courseModel.findOneAndDelete({_id: id})

  if (!course) {
      return res.status(400).json({error: "No such course"})
  }

  res.status(200).json(course)

}

// get user - instructor only
export const getAllInstructors = async (req, res) => {
  
  
  try {
      const instructors = await userModel.find({ role: "instructor" }).sort({ first_name: 1, last_name: 1 });
      res.status(200).json(instructors);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

export const getSingleInstructor = async(req, res) => {
  const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such user'})
    }

    const user = await userModel.findById(id)

    if (!user) {
        return res.status(404).json({error: "No such user"})
    }

    res.status(200).json(user)

}

//get enrolled user courses
export const getEnrolledCourses = async (req, res) => {
  const { username } = req.params;

  try {
    // Fetch user by username
    const userWithEnrollments = await userModel.findOne({ username: username });
    
    // If no user found, send a 404 response
    if (!userWithEnrollments) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the IDs of the enrolled courses
    const enrolledCourseIds = userWithEnrollments.courses.map(c => c.courseId);
    
    // Fetch all courses where the _id is in enrolledCourseIds
    const courses = await courseModel.find({
      '_id': { $in: enrolledCourseIds }
    });

    // Send the courses in the response
    res.status(200).json(courses);
  } catch (error) {
    // Handle potential errors
    res.status(500).json({ error: error.message });
  }
};

export const getInstructorCourses = async (req, res) => {
  const { id } = req.params;

  try {
    const courses = await courseModel.find({ instructor: id }); // Ensure that the model name is correct and follows your naming conventions
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getEnrolledStudents = async (req, res) => {
  const { id } = req.params; // Make sure that 'id' is the course ID passed in the request
  try {
    // Assuming the 'courses.courseId' contains the ID of the course
    const students = await userModel.find({ 'courses.courseId': id }).populate('courses.courseId');
    // You may need to adjust the populate method to match your Course model's naming convention
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
