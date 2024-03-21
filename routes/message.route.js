import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller.js';
// import protectRoute from '../middleware/protectRoute.js';
import requireAuth from '../middleware/requireAuth.js';

const messageRouter = express.Router();

messageRouter.get("/:id", requireAuth, getMessages);
messageRouter.post("/send/:id", requireAuth, sendMessage);

export default messageRouter;
