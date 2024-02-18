import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from 'dotenv';
import { ErrorMiddleware } from './middleware/error.js';
import userRouter from "./routes/user.route.js";

// Configure environment variables
config();

export const app = express();

// Body parser
app.use(express.json({ limit: "50mb" }));

// Cookie parser
app.use(cookieParser());

// CORS for resource sharing
app.use(cors({
    origin: process.env.ORIGIN
}));

// Routes
app.use("/api/v1", userRouter);

// Testing API
app.get("/test", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

// Unknown routes
app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});

app.use(ErrorMiddleware);
