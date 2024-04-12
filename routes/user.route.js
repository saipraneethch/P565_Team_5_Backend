import express from 'express';
import { getUsersForSidebar, registrationUser, activateUser, loginUser,updatePasswordEmail ,updatePasswordCode, updatePasswordReset, handleOAuthLogin} from '../controllers/user.controller.js';
import requireAuth from '../middleware/requireAuth.js';

const userRouter = express.Router();

userRouter.post('/registration', registrationUser);
userRouter.post('/activate-user', activateUser);
userRouter.post('/login-user', loginUser)
userRouter.post('/update-password-email', updatePasswordEmail)
userRouter.post('/update-password-code',updatePasswordCode)
userRouter.post('/update-password-reset',updatePasswordReset)
userRouter.post('/oauth',handleOAuthLogin)

userRouter.get('/sidebar-users/:user_token', requireAuth, getUsersForSidebar)



export default userRouter;
