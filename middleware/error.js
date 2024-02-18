import ErrorHandler from '../utils/errorHandler.js';


export const ErrorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server error';

    // Wrong MongoDB id error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Duplicate key error
    if (err.code === 11000) { // Fixed to check err.code instead of err.name for duplicate key error
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong jwt error
    if (err.name === 'JsonWebTokenError') {
        const message = `Json web token is invalid. Try again`;
        err = new ErrorHandler(message, 400);
    }

    // JWT expired error
    if (err.name === 'TokenExpiredError') {
        const message = `Json web token is expired. Try again`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
