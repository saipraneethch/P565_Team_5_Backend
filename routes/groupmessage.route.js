import express from 'express';
import { getMessages, sendMessageGroup, getGroupConversations, createGroupChat } from '../controllers/groupmessage.controller.js';//from group message
// import protectRoute from '../middleware/protectRoute.js';
import requireAuth from '../middleware/requireAuth.js';
import { group } from 'console';

const groupMessageRouter = express.Router();

groupMessageRouter.get("/:id", requireAuth, getMessages);//id will be defined as conversation id, not sender or recipient user id
// groupMessageRouter.post("/send", requireAuth, sendMessage);

messageRouter.post("/sendgroup/:id", requireAuth, sendMessageGroup);//will take the conversation id

groupMessageRouter.get("/conversations/:id", requireAuth, getGroupConversations);//for sidebar
groupMessageRouter.post("/creategroup", createGroupChat);

export default groupMessageRouter;
