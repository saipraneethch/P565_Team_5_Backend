import express from "express";

//imnporting workoutController
import { getUsers,getUser,deleteUser,updateUser, verifyAdmin, checkUsername } from "../controllers/edituser.controller.js";

import { requireAuth } from "../middleware/requireAuth.js";
//creates an instance of the router
const editUserRouter = express.Router()


//remember to uncomment this later and figure out below to make everything work lol
//editUserRouter.use(requireAuth)


editUserRouter.get('/',getUsers)

//GET a single a user
editUserRouter.get('/:id',getUser)

//DELETE a user
editUserRouter.delete('/:id',deleteUser)

//UPDATE a user
editUserRouter.patch('/:id',updateUser)

//verify admin [password for updating user details
editUserRouter.post('/verify-admin',verifyAdmin)

//check if username already exists for updating user details
editUserRouter.get('/check-username/:username',checkUsername)


export default editUserRouter;