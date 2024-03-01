import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please enter course code'],
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Please enter course title'],
    },
    description: {
        type: String,
        required: [true, 'Please enter course description'],
    },
    category: [{
        type: String, // Assuming categories are just strings; adjust as necessary
    }],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    bibliography: [{
        title: String,
        author: String,
    }]
}, { timestamps: true });



courseSchema.pre("save", async function (next) {
    
    if (this.code && this.isModified("code")) {
      this.code = this.code.toUpperCase();
    }
  
    next();
  });

const courseModel = mongoose.model("Course", courseSchema);

export default courseModel;
