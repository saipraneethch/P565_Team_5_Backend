import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter assignment title'],
  },
  description: {
    type: String,
    required: [true, 'Please enter assignment description'],
  },
  fileUrl: {
    type: String, 
    required: false, // Make this optional as not all assignments may have a file
  },
  startDate: {
    type: Date,
    required: [true, 'Please enter start date for assignment'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Please enter due date for assignment'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Course',
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedOn: {
      type: Date,
      default: Date.now,
    },
    submissionType: {
      type: String,
      required: true,
    },
    submissionContent: {
      type: String,
      required: true // The actual content: could be file path, text, URL, or media link
    },
    grade: {
      type: Number,
    },
    feedback: {
      type: String,
    },
  }],
  
}, { timestamps: true });

const assignmentModel = mongoose.model('Assignment', assignmentSchema);

export default assignmentModel;
