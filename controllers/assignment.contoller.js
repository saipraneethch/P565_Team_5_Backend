import userModel from '../models/user.model.js'
import courseModel from '../models/course.model.js';

import assignmentModel from '../models/assignment.model.js';
import mongoose from 'mongoose';

export const getAssignments = async (req, res) => {
    try {
        const { course_id, instructor_id } = req.params;

        // Validate request parameters
        if (!course_id || !instructor_id) {
            return res.status(400).json({ message: "Both course_id and instructor_id are required." });
        }

        // Validate the ObjectIds
        if (!mongoose.isValidObjectId(course_id) || !mongoose.isValidObjectId(instructor_id)) {
            return res.status(400).json({ message: "Invalid course or instructor ID." });
        }

        // Fetch assignments where the course and instructor match the provided IDs
        const assignments = await assignmentModel.find({
            course: course_id,
            instructor: instructor_id
        });
        
        // If no assignments found, return a 404 response
        if (assignments.length === 0) {
            return res.status(404).json({ message: "No assignments found for the provided IDs." });
        }

        // Return the assignments
        res.status(200).json({ data: assignments });
    } catch (error) {
        console.error("Failed to fetch assignments:", error);
        res.status(500).json({ message: "An error occurred while fetching assignments.", error: error.toString() });
    }
};



export const addAssignment = async (req, res) => {
    // req.body contains the text fields
    const { title, description, startDate, dueDate, course, instructor } = req.body;
    // req.file contains information about the file
    let fileUrl;
    // Check if a file is uploaded and construct the file URL
    if (req.file) {
        fileUrl = `${req.protocol}://${req.get('host')}/assignmentUploads/${req.file.filename}`;
        // fileUrl = `http://localhost:8000/assignmentUploads/${req.file.filename}`;
        

    }

    try {
        // Create and save the new assignment to the database, including the file URL if available
        const newAssignment = await assignmentModel.create({
            title,
            description,
            startDate,
            dueDate,
            course,
            instructor,
            ...(fileUrl && { fileUrl }) // Spread operator to conditionally add fileUrl property
        });

        res.status(201).json(newAssignment);
    } catch (error) {
        console.error('Error creating new assignment:', error);
        res.status(500).json({ message: 'Error creating new assignment', error });
    }
};

export const deleteAssignment = async(req, res) => {
    try {
        const { id } = req.params;
    
        const result = await assignmentModel.findByIdAndDelete(id);
        
        if (!result) {
          return res.status(404).json({ message: "Assignment not found" });
        }
        // Send back a success response
        res.json({ message: "Assignment deleted successfully" });
      } catch (error) {
        // If an error occurs, log it and send back a 500 status with the error message
        console.error("Error deleting assignment:", error);
        res.status(500).json({ error: error.message });
      }

}

export const updateAssignment = async(req, res) => {
    try {
        console.log("Inside updateAssignment");
        const { id } = req.params;
        
        // Combine text fields and file information (if a file was uploaded)
        const updateValues = { ...req.body };
        console.log(updateValues)
        if (req.file) {
            updateValues.assignmentFile = req.file.path; // Include file path in the update object
        }

        // Validate updateValues here as necessary

        const result = await assignmentModel.findByIdAndUpdate(id, updateValues, { new: true });

        if (!result) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        res.json({ message: "Assignment updated successfully", assignment: result });
    } catch (error) {
        console.error("Error updating assignment:", error);
        res.status(500).json({ error: error.message });
    }
}

