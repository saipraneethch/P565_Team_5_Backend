import express from "express";
import userModel from "../models/user.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";

import jwt from "jsonwebtoken";

import { config } from "dotenv";

config(); // Load environment variables

import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail.js";

import { fileURLToPath } from "url";

import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Register user
export const registrationUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { first_name,last_name,username, email, password } = req.body;

    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exists", 400));
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

    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.first_name }, activationCode };
    console.log(__dirname)

    // Adjusting the path resolution for the EJS template
    const templatePath = path.join(__dirname, "../mails/activation-mail.ejs");
    console.log(templatePath);


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
    const { activation_token, activation_code } = req.body;
    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    const { first_name,last_name,username, email, password } = newUser.user;


    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const existUsername = await userModel.findOne({ username });

    if (existUsername) {
      return next(new ErrorHandler("Username already exists", 400));
    }

    await userModel.create({
      first_name,
      last_name,
      username,
      email,
      password,
    });

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const loginUser = async (req,res) => {
  
  const {username, password} = req.body
  

  try {
      const user = await userModel.login( username, password)
      
      // const token = createToken(user._id)

      res.status(200).json({username})

  }catch (error){
      res.status(400).json({error: error.message})
  }
  //res.json({mssg:"Login user"})
}

