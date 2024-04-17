import mongoose from 'mongoose';

const announcementsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter assignment title'],
  },
  description: {
    type: String,
    required: [true, 'Please enter assignment description'],
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
  
}, { timestamps: true });

const announcementsModel = mongoose.model('Announcements', announcementsSchema);

export default announcementsModel;
