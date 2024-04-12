import express from 'express';
import { getMessages, sendMessage, getGroupConversations } from '../controllers/groupmessage.controller.js';//from group message
// import protectRoute from '../middleware/protectRoute.js';
import requireAuth from '../middleware/requireAuth.js';

const groupMessageRouter = express.Router();

groupMessageRouter.get("/:id", requireAuth, getMessages);//id will be defined as conversation id, not sender or recipient user id
groupMessageRouter.post("/send", requireAuth, sendMessage);

groupMessageRouter.get("/conversations/:id", requireAuth, getGroupConversations);//for sidebar

export default groupMessageRouter;
