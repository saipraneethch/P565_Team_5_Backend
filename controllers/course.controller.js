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


// get user - instructor only
export const getInstructors = async (req, res) => {
  
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

// Fetch grades for a specific user
export const fetchUserGrades = CatchAsyncError(async (req, res, next) => {
  try {
    const { userId } = req.params; // Assuming userId is passed as a route parameter
    const user = await userModel.findById(userId); // Find the user by ID

    //

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Fetch grades for the user from the Grade model
    const grades = await gradeModel.find({ user: userId });

    res.status(200).json({
      success: true,
      grades,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Update grades for a specific user
export const updateUserGrades = CatchAsyncError(async (req, res, next) => {
  try {
    const { userId } = req.params; // assuming userId is passed as a route parameter
    const { courseId, grade } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // update or create a new grade entry for the user and course
    const updatedGrade = await gradeModel.findOneAndUpdate(
      { user: userId, course: courseId },
      { grade },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      grade: updatedGrade,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//will add controllers for course title, etc.