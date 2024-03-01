import express from 'express';
import {addCourse,getCourses,getInstructors, getSingleInstructor} from '../controllers/course.controller.js';

const courseRouter = express.Router();

courseRouter.post('/add-course', addCourse);
courseRouter.get('/',getCourses)

//get all instructors
courseRouter.get('/get-instructors',getInstructors)

courseRouter.get('/get-single-instructor/:id',getSingleInstructor)

export default courseRouter;
