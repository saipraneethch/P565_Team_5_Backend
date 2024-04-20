import express from 'express';
import { getConversations, createConversation } from '../controllers/conversation.controller.js';
// import protectRoute from '../middleware/protectRoute.js';
import requireAuth from '../middleware/requireAuth.js';

const conversationRouter = express.Router();

conversationRouter.get("/get/:id", requireAuth, getConversations);
conversationRouter.post("/create", requireAuth, createConversation)

export default conversationRouter;
