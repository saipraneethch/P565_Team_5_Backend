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
        }).sort({dueDate:1});
        
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

export const submitAssignment = async(req, res) => {
    try {
        // Extract data from request body
        const { assignment_id, user, fileUrl, fileType } = req.body;
        console.log(req.body)
    
        // Find the assignment by ID
        const assignment = await assignmentModel.findById(assignment_id.assignment_id);
        console.log("assignment",assignment)
    
        if (!assignment) {
          return res.status(404).json({ error: 'Assignment not found' });
        }
    
        // Create submission object
        const submission = {
          student: user,
          submissionType: fileType,
          submissionContent: fileUrl // Assuming fileUrl is the content of the submission
        };
    
        // Delete existing submissions for the same assignment and user
        await assignmentModel.updateOne(
            { _id: assignment_id.assignment_id, 'submissions.student': user },
            { $pull: { submissions: { student: user } } }
        );
        // Add the submission to the assignment's submissions array
        assignment.submissions.push(submission);
    
        // Save the updated assignment
        await assignment.save();
    
        // Respond with success message
        res.status(200).json({ message: 'Assignment submitted successfully' });
      } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }

}

export const getSubmittedFiles = async (req, res) => {
    try {
        const { assignment_id, user_id } = req.params;
        
        // Find the assignment based on assignment_id and student user_id
        const assignment = await assignmentModel.findOne({
            _id: assignment_id,
            'submissions.student': user_id
        });

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Extract submitted files from the assignment
        const submittedFiles = assignment.submissions
            .filter(submission => submission.student.toString() === user_id)
            .map(submission => ({
                submissionContent: submission.submissionContent, 
                submittedOn: submission.submittedOn 
            }));

        res.status(200).json({ submittedFiles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
