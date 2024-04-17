import userModel from "../models/user.model.js";
import courseModel from "../models/course.model.js";

import assignmentModel from "../models/assignment.model.js";
import mongoose from "mongoose";

export const getAssignments = async (req, res) => {
  try {
    const { course_id, instructor_id } = req.params;

    // Validate request parameters
    if (!course_id || !instructor_id) {
      return res
        .status(400)
        .json({ message: "Both course_id and instructor_id are required." });
    }

    // Validate the ObjectIds
    if (
      !mongoose.isValidObjectId(course_id) ||
      !mongoose.isValidObjectId(instructor_id)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid course or instructor ID." });
    }

    // Fetch assignments where the course and instructor match the provided IDs
    const assignments = await assignmentModel
      .find({
        course: course_id,
        instructor: instructor_id,
      })
      .sort({ dueDate: 1 });

    // If no assignments found, return a 404 response
    if (assignments.length === 0) {
      return res
        .status(404)
        .json({ message: "No assignments found for the provided IDs." });
    }

    // Return the assignments
    res.status(200).json({ data: assignments });
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching assignments.",
        error: error.toString(),
      });
  }
};

export const addAssignment = async (req, res) => {
  // req.body contains the text fields
  const { title, description, startDate, dueDate, course, instructor } =
    req.body;
  // req.file contains information about the file
  let fileUrl;
  // Check if a file is uploaded and construct the file URL
  if (req.file) {
    fileUrl = `${req.protocol}://${req.get("host")}/assignmentUploads/${
      req.file.filename
    }`;
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
      ...(fileUrl && { fileUrl }), // Spread operator to conditionally add fileUrl property
    });

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error("Error creating new assignment:", error);
    res.status(500).json({ message: "Error creating new assignment", error });
  }
};

export const deleteAssignment = async (req, res) => {
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
};

export const updateAssignment = async (req, res) => {
  try {
    console.log("Inside updateAssignment");
    const { id } = req.params;

    // Combine text fields and file information (if a file was uploaded)
    const updateValues = { ...req.body };
    console.log(updateValues);
    if (req.file) {
      updateValues.assignmentFile = req.file.path; // Include file path in the update object
    }

    // Validate updateValues here as necessary

    const result = await assignmentModel.findByIdAndUpdate(id, updateValues, {
      new: true,
    });

    if (!result) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json({
      message: "Assignment updated successfully",
      assignment: result,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ error: error.message });
  }
};

export const submitAssignment = async (req, res) => {
    try {
      // Extract data from request body
      const { assignment_id, user, fileUrl, fileType } = req.body;
  
      // Find the assignment by ID
      const assignment = await assignmentModel.findById(
        assignment_id.assignment_id
      );
  
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
  
      // Check if the student has already submitted the assignment
      const existingSubmission = assignment.submissions.find(
        (submission) => submission.student.toString() === user.toString()
      );
  
      if (existingSubmission) {
          // Append new file URL to existing submission's submissionContent array
          existingSubmission.submissionContent.push(fileUrl);
          
          // Add the current date and time to the submittedOn array
          existingSubmission.submittedOn.push(Date.now());
        }
         else {
        // Create new submission object
        const newSubmission = {
          student: user,
          submissionType: fileType,
          submissionContent: [fileUrl], // Create an array with the new file URL
          submittedOn: [Date.now()] 
        };
        // Add new submission to submissions array
        assignment.submissions.push(newSubmission);
      }
  
      // Save the updated assignment
      await assignment.save();
  
      // Respond with success message
      res.status(200).json({ message: "Assignment submitted successfully" });
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

export const getSubmittedFiles = async (req, res) => {
  try {
    const { assignment_id, user_id } = req.params;

    // Find the assignment based on assignment_id and student user_id
    const assignment = await assignmentModel.findOne({
      _id: assignment_id,
      "submissions.student": user_id,
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const submission = assignment.submissions.find(
      (submission) => submission.student.toString() === user_id
    );
    if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
  
      const submittedFiles = submission.submissionContent.map((content, index) => ({
        content,
        submittedOn: Array.isArray(submission.submittedOn) ? 
          new Date(submission.submittedOn[index]).toLocaleString() : 
          new Date(submission.submittedOn).toLocaleString()
      }));
     // Sort the submittedFiles array by submittedOn date in descending order
submittedFiles.sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn));

    res.status(200).json({ submittedFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSubmittedStudents = async (assignment) => {
  try {
    const submittedStudents = [];

    // Map over submissions and fetch user details concurrently
    await Promise.all(
      assignment.submissions.map(async (submission) => {
        // Fetch user details using the student ID from userModel
        const user = await userModel.findOne({ _id: submission.student });
        if (user) {
          // Check if the student ID already exists in the submittedStudents array
          const isDuplicate = submittedStudents.some(
            (student) => student.id === user._id
          );
          if (!isDuplicate) {
            submittedStudents.push({
              id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
            });
          }
        }
      })
    );

    return submittedStudents;
  } catch (error) {
    console.error("Error fetching submitted students:", error);
    throw error; // Propagate the error to the caller
  }
};

export const fetchAllStudents = async (req, res) => {
  try {
    const { assignment_id } = req.body;

    // Find the assignment
    const assignment = await assignmentModel.findOne({ _id: assignment_id });

    // Check if the assignment exists
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Fetch submitted students
    const submittedStudents = await getSubmittedStudents(assignment);

    const course_id = assignment.course;

    // Find all students enrolled in the specified course
    const students = await userModel.find({ "courses.courseId": course_id });

    //if the from students is not presnt in submittedStudents, then it will be added to not submitted students.
    // Filter out students who have not submitted the assignment

    const notSubmittedStudents = students.filter((student) => {
      // Convert ObjectId to string for comparison
      const studentId = student._id.toString();
      // Check if the student's ID is not present in the submittedStudents array
      return !submittedStudents.some(
        (submittedStudent) => submittedStudent.id.toString() === studentId
      );
    });

    res
      .status(200)
      .json({ assignment, submittedStudents, notSubmittedStudents });
  } catch (error) {
    console.error("Error fetching submitted students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getStudentSubmittedAssignment = async (req, res) => {
  try {
    const { student_id, assignment_id } = req.params;

    // Find the assignment
    const assignment = await assignmentModel.findOne({ _id: assignment_id });

    // Check if the assignment exists
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Convert student_id string to ObjectId
    const studentId = new mongoose.Types.ObjectId(student_id);

    // Find submissions by the student for the assignment
    const student_submissions = assignment.submissions.filter((submission) =>
      submission.student.equals(studentId)
    );

    // Find user details for the student
    const user = await userModel.findOne({ _id: studentId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract relevant student details
    const student_detail = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    res.status(200).json({ student_submissions, student_detail });
  } catch (error) {
    console.error("Error fetching student submitted assignment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const submitFeedbackGrade = async (req, res) => {
    const { student_id, assignment_id, feedback, grade } = req.body;

    try {
        // Validate input data
        if (!student_id || !assignment_id) {
            return res.status(400).json({ error: "Student ID and Assignment ID are required" });
        }

        // Find the assignment by ID
        const assignment = await assignmentModel.findOne({ _id: assignment_id });

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        // Find the student in the assignment
        const student = assignment.submissions.find(submission => submission.student.toString() === student_id);

        if (!student) {
            return res.status(404).json({ error: "Student not found in the assignment" });
        }

        // Update student's grade and feedback
        student.grade = grade;
        student.feedback.push(feedback) 

        // Save the assignment
        await assignment.save();

        // Return success response
        return res.status(200).json({ message: "Feedback and grade submitted successfully" });
    } catch (error) {
        console.error("Error submitting feedback and grade:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
