import express from 'express';
import {addCourse,getCourses,getAllInstructors,updateCourse, getSingleInstructor,getCourse,deleteCourse, getEnrolledCourses,getInstructorCourses,getEnrolledStudents, uploadContent, displayContent,deleteContent,getCourseGrades, getInstructorCoursesForChart, getAdminViewForChart, getStudentCoursesForChart} from '../controllers/course.controller.js';

const courseRouter = express.Router();

courseRouter.post('/add-course', addCourse);
courseRouter.get('/',getCourses)
//GET a single course
courseRouter.get('/:id',getCourse)
courseRouter.delete('/:id',deleteCourse)
//UPDATE a user
courseRouter.patch('/update-course/:id', updateCourse)

//get all instructors
courseRouter.get('/get-instructors/all-instructors',getAllInstructors)

courseRouter.get('/get-single-instructor/:id',getSingleInstructor)

courseRouter.get('/get-user-courses/:username',getEnrolledCourses)

courseRouter.get('/get-instructor-courses/:id',getInstructorCourses)

courseRouter.get('/enrolled-students/:id',getEnrolledStudents)

courseRouter.post('/upload-content',uploadContent)

courseRouter.get('/display-content/:id',displayContent)

courseRouter.delete('/delete-content/:id',deleteContent)

courseRouter.get('/get-course-grades/:username',getCourseGrades)

courseRouter.get('/get-instructor-courses-for-charts/:id',getInstructorCoursesForChart)

courseRouter.get('/admin/chart-data',getAdminViewForChart)

courseRouter.get('/student/chart-data/:id',getStudentCoursesForChart)

export default courseRouter;
