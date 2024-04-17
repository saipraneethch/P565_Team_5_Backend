import express from "express";

//imnporting workoutController
import { getUsers, getUser, deleteUser, updateUser, verifyAdmin, checkUsername, updateUserCourse, checkEnrollment, dropUserCourse, getUserByUsername } from "../controllers/edituser.controller.js";

import { requireAuth } from "../middleware/requireAuth.js";
//creates an instance of the router
const editUserRouter = express.Router()


//remember to uncomment this later and figure out below to make everything work lol
//editUserRouter.use(requireAuth)


editUserRouter.get('/', getUsers)

//GET a single a user
editUserRouter.get('/:id', getUser)
editUserRouter.get('/username/:username', getUserByUsername)


//DELETE a user
editUserRouter.delete('/:id', deleteUser)

//UPDATE a user
editUserRouter.patch('/:id', updateUser)

//UPDATE a user
editUserRouter.patch('/:username/enroll', updateUserCourse)

//check if user is enrolled
editUserRouter.get('/check-enrollment/:username/:courseId', checkEnrollment);

//verify admin [password for updating user details
editUserRouter.post('/verify-admin', verifyAdmin)

//check if username already exists for updating user details
editUserRouter.get('/check-username/:username', checkUsername)

// PUT request to drop a course for a user
editUserRouter.put('/:username/drop-course', dropUserCourse);


export default editUserRouter;