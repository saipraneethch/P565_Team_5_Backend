import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter title'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Course',
  },
  fileUrl:{
    type:String,
    required:[true,'Please upload file']
  },
  fileType: {
    type: String,
    required: [true, 'Please specify file type']
  },
  
}, { timestamps: true });

const moduleModel = mongoose.model('Module', ModuleSchema);

export default moduleModel;
