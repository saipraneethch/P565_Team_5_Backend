import express from 'express';
import { registrationUser, activateUser, loginUser,updatePasswordEmail ,updatePasswordCode, updatePasswordReset} from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.post('/registration', registrationUser);
userRouter.post('/activate-user', activateUser);
userRouter.post('/login-user', loginUser)
userRouter.post('/update-password-email', updatePasswordEmail)
userRouter.post('/update-password-code',updatePasswordCode)
userRouter.post('/update-password-reset',updatePasswordReset)

export default userRouter;
