import mongoose from "mongoose";
import bcrypt from "bcryptjs";
// const validator = require('validator');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Please enter first name"],
    },
    last_name: {
      type: String,
      required: [true, "Please enter last name"],
    },
    username: {
      type: String,
      required: [true, "Please enter username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value) {
          return emailRegex.test(value);
        },
        message: "Please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [
        function () {
          return this.isLocal;
        },
        "Please enter your password",
      ],
      minlength: [6, "Password must be at least 6 characters"],
    },
    isLocal: {
      type: Boolean,
      default: true,
    },

    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course'
        },
        grades: {
          type: Number, 
          default: null // Default value for grade is null
        }
      }
    ]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Capitalize the first letter of the first name
  if (this.first_name && this.isModified("first_name")) {
    this.first_name =
      this.first_name.charAt(0).toUpperCase() +
      this.first_name.slice(1).toLowerCase();
  }

  // Capitalize the first letter of the last name
  if (this.last_name && this.isModified("last_name")) {
    this.last_name =
      this.last_name.charAt(0).toUpperCase() +
      this.last_name.slice(1).toLowerCase();
  }

  // Convert the username to lowercase
  if (this.username && this.isModified("username")) {
    this.username = this.username.toLowerCase();
  }

  // Convert the role to lowercase
  if (this.role && this.isModified("role")) {
    this.role = this.role.toLowerCase();
  }

  if (!this.isModified("password")) {
    next(); // If password is not modified, move on to the next middleware
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//static login method
userSchema.statics.login = async function (username, password) {
  //validation
  if (!username || !password) {
    throw Error("All fields must be required");
  }

  const user = await this.findOne({ username });
  console.log(user);

  if (!user) {
    throw Error("Incorrect username or username does not exist.");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }
  return user;
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
