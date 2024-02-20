import express from "express";
import userModel from "../models/user.model.js";
import gradeModel from "../models/grade.model.js"; // Import the Grade model
import ErrorHandler from "../utils/errorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";


// Fetch grades for a specific user
export const fetchUserGrades = CatchAsyncError(async (req, res, next) => {
  try {
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