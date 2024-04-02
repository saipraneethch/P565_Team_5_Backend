import express from 'express';
import {addCourse,getCourses,getAllInstructors, getSingleInstructor,getCourse,deleteCourse, getEnrolledCourses,getInstructorCourses,getEnrolledStudents} from '../controllers/course.controller.js';

const courseRouter = express.Router();

courseRouter.post('/add-course', addCourse);
courseRouter.get('/',getCourses)
//GET a single course
courseRouter.get('/:id',getCourse)
courseRouter.delete('/:id',deleteCourse)

//get all instructors
courseRouter.get('/get-instructors',getAllInstructors)

courseRouter.get('/get-single-instructor/:id',getSingleInstructor)

courseRouter.get('/get-user-courses/:username',getEnrolledCourses)

courseRouter.get('/get-instructor-courses/:id',getInstructorCourses)

courseRouter.get('/enrolled-students/:id',getEnrolledStudents)

export default courseRouter;
