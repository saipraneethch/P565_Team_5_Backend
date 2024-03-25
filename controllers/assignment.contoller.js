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
        console.log(assignments)
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
    // Get data from request body
    const { title, description, startDate, dueDate, course, instructor } = req.body;

    try {
        // Directly create and save the new assignment to the database
        const newAssignment = await assignmentModel.create({
            title,
            description,
            startDate,
            dueDate,
            course,
            instructor
        });

        // Send back the newly created assignment as a response
        res.status(201).json(newAssignment);
    } catch (error) {
        // If an error occurs, send an error response
        console.error('Error creating new assignment:', error);
        res.status(500).json({ message: 'Error creating new assignment', error: error });
    }
};