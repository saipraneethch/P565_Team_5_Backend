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
      enum: ['file', 'text', 'url', 'media'], // Ensure that only these four submission types are allowed
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
