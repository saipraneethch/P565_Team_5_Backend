import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import { ErrorMiddleware } from "./middleware/error.js";
import userRouter from "./routes/user.route.js";
import editUserRouter from "./routes/edituser.route.js";
import courseRouter from "./routes/course.route.js";
import messageRouter from "./routes/message.route.js";
import assignmentRouter from "./routes/assignment.route.js";
import announcementsRouter from "./routes/announcements.route.js";

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment variables
config();

export const app = express();

// Body parser
app.use(express.json({ limit: "50mb" }));

// Cookie parser, middleware
app.use(cookieParser());

// Serve static files from the 'assignmentUploads' directory
app.use('/assignmentUploads', express.static(path.join(__dirname, 'assignmentUploads')));

const allowedOrigins = process.env.ORIGIN.split(',');

// CORS for resource sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        var message = 'The CORS policy for this site does not ' +
                      'allow access from the specified Origin.';
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

// Routes
app.use("/api/v1", userRouter); //this is the user api endpoint
app.use("/api/v1/userdetails", editUserRouter);//route, reference to route imported above
app.use("/api/v1/coursedetails", courseRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/assignments",assignmentRouter);
app.use("/api/v1/announcements",announcementsRouter);

// Testing API
app.get("/test", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: "Backend API is running" });
});


// Unknown routes
app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
