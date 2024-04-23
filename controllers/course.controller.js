import express from "express";
import userModel from "../models/user.model.js";
import courseModel from "../models/course.model.js"; 
import moduleModel from "../models/modules.model.js";
import assignmentModel from "../models/assignment.model.js"
import announcementsModel from "../models/announcements.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import mongoose from "mongoose";

//get all courses
export const getCourses = async (req, res) => {
  const courses = await courseModel.find().sort({ code: 1 });
  res.status(200).json(courses);
};

//get a single course
export const getCourse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such course" });
  }

  const course = await courseModel.findById(id);

  if (!course) {
    return res.status(404).json({ error: "No such course" });
  }

  res.status(200).json(course);
};

export const addCourse = async (req, res) => {
  const {
    code,
    title,
    description,
    category,
    instructor,
    start_date,
    end_date,
    bibliography,
  } = req.body;

  let emptyFields = [];
  if (!code) emptyFields.push("code");
  if (!title) emptyFields.push("title");
  if (!description) emptyFields.push("description");
  if (!category) emptyFields.push("category");
  if (!instructor) emptyFields.push("instructor");
  if (!start_date) emptyFields.push("start_date");
  if (!end_date) emptyFields.push("end_date");

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields.", emptyFields });
  }

  // Validate the instructor ObjectId
  if (!mongoose.Types.ObjectId.isValid(instructor)) {
    return res.status(400).json({ error: "Invalid instructor ID" });
  }

  // Check if instructor exists
  const instructorExists = await userModel.findById(instructor);
  if (!instructorExists) {
    return res.status(404).json({ error: "Instructor not found" });
  }

  // Find the user by their username
  const course_code = await courseModel.findOne({ code: code.toUpperCase() });

  if (course_code) {
    return res.status(409).json({ error: "Course code already exists." });
  }

  try {
    // Convert comma-separated strings to arrays if necessary
    const parsedCategory =
      typeof category === "string" ? category.split(",") : category;
    const parsedBibliography =
      typeof bibliography === "string"
        ? bibliography.split(",").map((item) => {
            const [title, author] = item.split(";").map((part) => part.trim());
            return { title, author };
          })
        : bibliography;

    const course = await courseModel.create({
      code,
      title,
      description,
      category: parsedCategory,
      instructor,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      bibliography: parsedBibliography,
    });

    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//delete a user
export const deleteCourse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such course" });
  }

  const course = await courseModel.findOneAndDelete({ _id: id });

  if (!course) {
    return res.status(400).json({ error: "No such course" });
  }

  res.status(200).json(course);
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
 

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such course" });
  }

  try {
    // Attempt to update the user
    const course = await courseModel.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    // If no course is found or updated
    if (!course) {
      return res.status(404).json({ error: "No such course" });
    }

     // Convert the updated course data to a plain JavaScript object
     const updatedCourseData = course.toObject();
     res.status(200).json(updatedCourseData);
  } catch (error) {
    // Catch and handle potential errors, such as validation errors
    res.status(400).json({ error: error.message });
  }
};

// get user - instructor only
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await userModel
      .find({ role: "instructor" })
      .sort({ first_name: 1, last_name: 1 });
    
    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSingleInstructor = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such user" });
  }

  const user = await userModel.findById(id);

  if (!user) {
    return res.status(404).json({ error: "No such user" });
  }

  res.status(200).json(user);
};

//get enrolled user courses
export const getEnrolledCourses = async (req, res) => {
  const { username } = req.params;

  try {
    // Fetch user by username
    const userWithEnrollments = await userModel.findOne({ username: username });

    // If no user found, send a 404 response
    if (!userWithEnrollments) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the IDs of the enrolled courses
    const enrolledCourseIds = userWithEnrollments.courses.map(
      (c) => c.courseId
    );

    // Fetch all courses where the _id is in enrolledCourseIds
    const courses = await courseModel.find({
      _id: { $in: enrolledCourseIds },
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
    const students = await userModel
      .find({ "courses.courseId": id })
      .populate("courses.courseId");
    // You may need to adjust the populate method to match your Course model's naming convention
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadContent = async (req, res) => {

  const { title, course, fileUrl, fileType } = req.body;
  try {
    const module = await moduleModel.create({
      title,
      course,
      fileUrl,
      fileType,
    });

    res.status(200).json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const displayContent = async (req, res) => {
  try {
    const { id } = req.params;

    const modules = await moduleModel.find({ course: id }).populate("course");
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await moduleModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Module not found" });
    }
    // Send back a success response
    res.json({ message: "Module deleted successfully" });
  } catch (error) {
    // If an error occurs, log it and send back a 500 status with the error message
    console.error("Error deleting module:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCourseGrades = async (req, res) => {
  const { username } = req.params;

  try {
    // Fetch user by username
    const userWithEnrollments = await userModel.findOne({ username: username });

    // If no user found, send a 404 response
    if (!userWithEnrollments) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the IDs of the enrolled courses
    const enrolledCourseIds = userWithEnrollments.courses.map(
      (c) => c.courseId
    );

    // Fetch all courses where the _id is in enrolledCourseIds
    const courses = await courseModel.find({
      _id: { $in: enrolledCourseIds },
    });

    // Merge grades into courses
    const coursesWithGrades = courses.map((course) => {
      const enrollment = userWithEnrollments.courses.find((enrollment) =>
        enrollment.courseId.equals(course._id)
      );
      return {
        ...course,
        grades: enrollment ? enrollment.grades : null,
      };
    });

    // Send the courses with grades in the response
    res.status(200).json(coursesWithGrades);
  } catch (error) {
    // Handle potential errors
    res.status(500).json({ error: error.message });
  }
};

export const getInstructorCoursesForChart = async (req, res) => {
  const { id } = req.params;

  try {
    const courses = await courseModel.find({ instructor: id });

    const users = await userModel.find();

    // Create an empty object to store course details
    // Assuming `courses` is an array of course objects and `users` is an array of user objects

    // Create a dictionary with course ID as key
    const courseSummary = {};

    // Populate course details for each course
    courses.forEach((course) => {
      const courseId = course._id.toString();
      const courseCode = course.code;
      const courseTitle = course.title;

      // Find users enrolled in this course
      const enrolledUsers = users.filter((user) =>
        user.courses.some(
          (userCourse) => userCourse.courseId.toString() === courseId
        )
      );

      // Count the number of users enrolled
      const numberOfUsersEnrolled = enrolledUsers.length;

      // Calculate the average grade for this course
      const grades = enrolledUsers
        .map((user) =>
          user.courses.find(
            (userCourse) => userCourse.courseId.toString() === courseId
          )
        )
        .map((userCourse) => userCourse.grades)
        .filter((grade) => grade !== null);

      const averageGrade =
        grades.length > 0
          ? grades.reduce((a, b) => a + b, 0) / grades.length
          : null;

      // Add to the course summary
      courseSummary[courseId] = {
        courseCode,
        courseTitle,
        numberOfUsersEnrolled,
        averageGrade,
      };
    });


    // Respond with the coursesData object
    res.json(courseSummary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminViewForChart = async (req, res) => {
  try {
    const courses = await courseModel.find(); // Get all courses
    const users = await userModel.find(); // Get all users

    // Create a dictionary with course ID as key
    const courseSummary = {};

    // Populate course details for each course
    courses.forEach((course) => {
      const courseId = course._id.toString();
      const courseCode = course.code;
      const courseTitle = course.title;

      // Find users enrolled in this course
      const enrolledUsers = users.filter((user) =>
        user.courses.some(
          (userCourse) => userCourse.courseId.toString() === courseId
        )
      );

      // Count the number of users enrolled
      const numberOfUsersEnrolled = enrolledUsers.length;

      // Add to the course summary
      courseSummary[courseId] = {
        courseCode,
        courseTitle,
        numberOfUsersEnrolled,
      };
    });


    // Initialize an empty object to store the count of each role
    const userSummary = {};

    // Iterate over each user to count the roles
    users.forEach((user) => {
      const role = user.role;

      // If the role is already in the userSummary, increment the count
      if (userSummary[role]) {
        userSummary[role]++;
      } else {
        // Otherwise, initialize the count for this role
        userSummary[role] = 1;
      }
    });

    // Respond with the combined data object
    res.json({ courseSummary, userSummary });
  } catch (error) {
    console.error('Error fetching data:', error); // Log the error
    res.status(500).json({ error: 'An error occurred while fetching admin view data.' });
  }
};


export const getStudentCoursesForChart = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch student by ID
    const student = await userModel.findById(id);

    // If no student is found, return a 404 response
    if (!student) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract the course IDs from the student's courses
    const enrolledCourseIds = student.courses.map((c) => c.courseId);

    // Fetch all courses where the _id is in enrolledCourseIds
    const courses = await courseModel.find({
      _id: { $in: enrolledCourseIds },
    });

    // Fetch all students to calculate grade statistics
    const all_students = await userModel.find();

    // Initialize an empty object for the student summary
    const studentSummary = {};

    // Iterate over the courses to build studentSummary
    courses.forEach((course) => {
      const courseId = course._id.toString();
      const courseCode = course.code;
      const courseTitle = course.title;

      // Find the student's grade for this course
      const studentCourse = student.courses.find(
        (c) => c.courseId.toString() === courseId
      );
      const studentGrade = studentCourse?.grades ?? "N/A"; // Student's grade

      // Get the grades for all students in this course
      const grades = all_students
        .map((student) => {
          const course = student.courses.find(
            (c) => c.courseId.toString() === courseId
          );
          return course?.grades;
        })
        .filter((grade) => grade !== null && grade !== undefined); // Filter out null or undefined grades

      // Calculate grade statistics
      const averageGrade = grades.length > 0 ? (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(2) : "N/A";
      const maxGrade = grades.length > 0 ? Math.max(...grades) : "N/A";
      const minGrade = grades.length > 0 ? Math.min(...grades) : "N/A";

      // Add the course details to studentSummary
      studentSummary[courseId] = {
        courseCode,
        courseTitle,
        studentGrade,
        averageGrade,
        maxGrade,
        minGrade,
      };
    });

    // Send the studentSummary as the response
    res.json({ studentSummary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentCoursesForDashboard = CatchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Fetch the student by ID
    const student = await userModel.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Extract course IDs from student's courses
    const enrolledCourseIds = student.courses.map((c) => c.courseId);

    // Dictionary to hold course info, assignments, and announcements for each course
    const coursesInfo = {};
    const assignments = {};
    const announcements = {};

    // Fetch the courses to get course metadata (code and title)
    const courses = await courseModel.find({
      _id: { $in: enrolledCourseIds },
    });

    // Populate the coursesInfo dictionary with course code and title
    courses.forEach((course) => {
      const courseId = course._id.toString();
      coursesInfo[courseId] = {
        courseCode: course.code,
        courseTitle: course.title,
      };
    });

    // Fetch upcoming assignments for all enrolled courses
    const allAssignments = await assignmentModel.find({
      course: { $in: enrolledCourseIds },
      dueDate: { $gte: new Date() }, // Only upcoming assignments
    }).sort({ dueDate: 1 }); // Sort by due date

    // Group assignments by course ID
    allAssignments.forEach((assignment) => {
      const courseId = assignment.course.toString();
      if (!assignments[courseId]) {
        assignments[courseId] = [];
      }
      assignments[courseId].push(assignment);
    });

    // Fetch latest announcements for all enrolled courses
    const allAnnouncements = await announcementsModel.find({
      course: { $in: enrolledCourseIds },
    }).sort({ createdAt: -1 }); // Sort by creation date to get latest

    // Group announcements by course ID
    allAnnouncements.forEach((announcement) => {
      const courseId = announcement.course.toString();
      if (!announcements[courseId]) {
        announcements[courseId] = [];
      }
      announcements[courseId].push(announcement);
    });



    // Return the dictionaries with course info, assignments, and announcements grouped by course ID
    res.status(200).json({
      coursesInfo,
      assignments,
      announcements,
    });
  } catch (error) {
    return next(new ErrorHandler('Error fetching data for dashboard', 500));
  }
});
