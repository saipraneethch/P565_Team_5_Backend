import express from 'express';
import {addCourse,getCourses,getInstructors, getSingleInstructor,getCourse,deleteCourse} from '../controllers/course.controller.js';

const courseRouter = express.Router();

courseRouter.post('/add-course', addCourse);
courseRouter.get('/',getCourses)
//GET a single course
courseRouter.get('/:id',getCourse)
courseRouter.delete('/:id',deleteCourse)

//get all instructors
courseRouter.get('/get-instructors',getInstructors)

courseRouter.get('/get-single-instructor/:id',getSingleInstructor)

export default courseRouter;
