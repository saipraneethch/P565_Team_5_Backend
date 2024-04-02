import express from 'express';
import { getAssignments,addAssignment } from '../controllers/assignment.contoller.js';

const assignmentRouter = express.Router();

assignmentRouter.post('/add-assignment', addAssignment);
assignmentRouter.get('/:course_id/:instructor_id',getAssignments)
//GET a single course
// courseRouter.get('/:id',getCourse)
// courseRouter.delete('/:id',deleteCourse)



export default assignmentRouter;
