import express from 'express';
import {addCourse,getCourses} from '../controllers/course.controller.js';

const courseRouter = express.Router();

courseRouter.post('/add-course', addCourse);
courseRouter.get('/',getCourses)


export default courseRouter;
