import express from 'express';
import multer from 'multer';
import { getAssignments, addAssignment, deleteAssignment , updateAssignment} from '../controllers/assignment.contoller.js';

const assignmentRouter = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './assignmentUploads'); // specify the directory to store files
  },
  filename: function(req, file, callback) {
    // Use the original filename or customize it
    callback(null, Date.now() + '-' + file.originalname);
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Modify the addAssignment route to use multer middleware for 'file' field
assignmentRouter.post('/add-assignment', upload.single('file'), addAssignment);
assignmentRouter.get('/:course_id/:instructor_id', getAssignments);
assignmentRouter.delete('/:id', deleteAssignment);
assignmentRouter.patch('/:id', upload.single('file'),updateAssignment);

export default assignmentRouter;
