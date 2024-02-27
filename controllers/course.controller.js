import express from "express";
import userModel from "../models/user.model.js";
import Course from "../models/course.model.js"; // Import the Grade model
import ErrorHandler from "../utils/errorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
//change error handling to match prithvi, follow user controller json line 177
//throw errors in user model, display in controller 

// Fetch grades for a specific user
export const fetchUserGrades = CatchAsyncError(async (req, res, next) => {
  try {
    //fetch session tokern to get userid
    //useAuthContext function in app.js
    //if null, means user is not logged in 
    //use username to get grades rather than user id
    //topNavbar.js in components folder, see how prithvi fetches username
    //must fetch username from front end in studentgradespage and then pass to backend
    //once you have username, 
    const { userId } = req.params; // Assuming userId is passed as a route parameter
    const user = await userModel.findById(userId); // Find the user by ID

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