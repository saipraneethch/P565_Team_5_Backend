import ErrorHandler from '../utils/errorHandler';
import { Request, Response , NextFunction } from "express";

export const ErrorMiddleware = (err:any,req:Request, res:Response, next:NextFunction) => {
    err.statusCode=err.statusCode || 500;
    err.message= err.message || 'Internal server error';

    //Wrong mongodb id
    if(err.name === 'CastError'){
        const message = `Resourse not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //Duplicate key error
    if(err.name === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    //Wrong jwt error
    if(err.name === 'JsonWebTokenError'){
        const message = `Json web token is invalid. Try again`;
        err = new ErrorHandler(message, 400);
    }

    //JWT expired error
    if(err.name === 'TokenExpiredError'){
        const message = `Json web token is expired. Try again`;
        err = new ErrorHandler(message, 400);
    }


    res.status(err.statusCode).json({
        success: false,
        message:err.message
    });
};