import express from 'express';
import { fetchUserGrades, updateUserGrades } from '../controllers/course.controller.js';

const courseRouter = express.Router();

courseRouter.post('/studentgrades', fetchUserGrades);
courseRouter.post('/updategrades', updateUserGrades);

export default courseRouter;
