import express from "express";
import userModel from "../models/user.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import validator from "validator";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import { config } from "dotenv";

config(); // Load environment variables

import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail.js";

import { fileURLToPath } from "url";

import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//create token
export const createToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.SECRET, { expiresIn: "3d" });
};

// Register user
export const registrationUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { first_name, last_name, username, email, password } = req.body;

    //validation
    if (!first_name.trim() || !last_name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      throw new Error("All fields must be required");
    }
    

    if (!validator.isEmail(email)) {
      throw Error("Email is not valid");
    }

    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exists", 400));
      //throw Error('Email already in use')
    }
    const isUsernameExist = await userModel.findOne({ username });
    if (isUsernameExist) {
      return next(new ErrorHandler("Username already exists", 400));
    }

    const user = {
      first_name,
      last_name,
      username,
      email,
      password,
    };

    const activationToken = createActivationToken(user);

    // Set the activation token as an HTTP-only cookie
    res.cookie("activationToken", activationToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // set to true if using https and in production
      maxAge: 300000, // 5 minutes in milliseconds
      sameSite: "strict", // adjust according to your requirements
    });

    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.first_name }, activationCode };

    // Adjusting the path resolution for the EJS template
    const templatePath = path.join(__dirname, "../mails/activation-mail.ejs");

    // Use the resolved path in ejs.renderFile
    try {
      const html = await ejs.renderFile(templatePath, data);

      // Your email sending logic...
    } catch (error) {
      // Handle any errors, e.g., template not found
      console.error("Error rendering email template:", error);
      return next(new ErrorHandler("Failed to generate email content", 500));
    }

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET,
    { expiresIn: "5m" }
  );
  return { token, activationCode };
};

// Activate user
export const activateUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { activation_code } = req.body;
    const activation_token = req.cookies.activationToken;
    console.log({ activation_token, activation_code });
    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    const { first_name, last_name, username, email, password } = newUser.user;

    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const existUsername = await userModel.findOne({ username });

    if (existUsername) {
      return next(new ErrorHandler("Username already exists", 400));
    }

    const user = await userModel.create({
      first_name,
      last_name,
      username,
      email,
      password,
    });

    const token = createToken(user._id);

    res.status(200).json({ username, role:user.role, token });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.login(username, password);

    const token = createToken(user._id);
    

    res.status(200).json({ username, role:user.role, token });

    // Destructure the user object to exclude the password when sending it back
    // const { password: userPassword, ...userWithoutPassword } = user.toObject();

    // // Return the modified user object without the password and the token
    // res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  //res.json({mssg:"Login user"})
};

// update password
export const updatePasswordEmail = CatchAsyncError(async (req, res, next) => {
  try {
    const { email } = req.body;

    //validation
    if (!email) {
      throw Error("All fields must be required");
    }

    if (!validator.isEmail(email)) {
      throw Error("Email is not valid");
    }

    const isEmailExist = await userModel.findOne({ email });
    if (!isEmailExist) {
      return next(new ErrorHandler("Email does not exist", 400));
      //throw Error('Email already in use')
    }

    const user = {
      email,
    };

    const activationToken = createActivationToken(user);

    // Set the activation token as an HTTP-only cookie
    res.cookie("activationToken", activationToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // set to true if using https and in production
      maxAge: 300000, // 5 minutes in milliseconds
      sameSite: "strict", // adjust according to your requirements
    });

    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.email }, activationCode };

    // Adjusting the path resolution for the EJS template
    const templatePath = path.join(
      __dirname,
      "../mails/forgot-password-mail.ejs"
    );

    // Use the resolved path in ejs.renderFile
    try {
      const html = await ejs.renderFile(templatePath, data);

      // Your email sending logic...
    } catch (error) {
      // Handle any errors, e.g., template not found
      console.error("Error rendering email template:", error);
      return next(new ErrorHandler("Failed to generate email content", 500));
    }

    try {
      await sendMail({
        email: user.email,
        subject: "Password Reset",
        template: "forgot-password-mail.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to reset your password`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Check OTP for update password
export const updatePasswordCode = async (req, res) => {
  try {
    const { activation_code } = req.body; // User-submitted OTP
    const activation_token = req.cookies.activationToken; // Token from cookies

    console.log({ activation_token, activation_code });

    // Check if activation token is provided
    if (activation_code === undefined || activation_code.trim() === '')
     {
      throw Error("No activation code provided");
    }

    // Verify the activation token
    const decoded = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
    console.log(decoded.activationCode);
    // Compare the OTP from the user input against the one stored in the token
    if (decoded.activationCode !== activation_code) {
      throw Error("Invalid activation code");
    }

    // If the OTP matches, proceed with the password update or whatever next steps are required
    // Since you're not using email in this step, you would typically proceed to update the user's password here
    // For demonstration, sending a success response
    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    // This catches any errors including token verification errors
    res.status(400).json({ error: error.message });
  }
};

// Update password in the database
export const updatePasswordReset = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    
    // Find the user by their email
    const user = await userModel.findOne({ email });
    if (!user) {
      throw Error('User not found with this email');
    }
    
    console.log("User found:", user); // Confirm user is found

    user.password = password;
    await user.save();
    console.log("User saved with new password"); // Confirm save completed

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error in updatePasswordReset:", error); // Use console.error to log any caught errors
    res.status(400).json({ error: error.message });
  }
};

export const handleOAuthLogin = async (req,res) => {

  const {first_name,last_name,username, email } = req.body;
  
  const newUser = {
    first_name: first_name,
    last_name: last_name,
    username: username,
    email: email,
    isLocal: false
  };

  try {
    let user = await userModel.findOne({ email: email });
    console.log('User found:', user);
  
    if (!user) {
      console.log('Creating new user');
      user = await userModel.create(newUser);
      console.log('New user created:', user);
    }
  
    console.log('User ID for token:', user._id);
    const token = createToken(user._id);
    console.log('Token created:', token);
    res.status(200).json({ username, role:user.role, token });
  } catch (error) {
    console.error('Error in handleOAuthLogin:', error);
    res.status(400).json({ error: error.message });
  }
};

