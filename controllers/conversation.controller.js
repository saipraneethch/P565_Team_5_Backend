import { clearScreenDown } from "readline";
import Conversation from "../models/conversation.model.js";
import jwt from "jsonwebtoken";

export const createConversation = async (req, res) => {
    try {
        const { receiverId } = req.body; // Assuming receiverId is passed in body
        const senderId = req.user._id; // Logged-in user's ID

        // Check if a conversation already exists between these participants
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // Create a new conversation if it does not exist
        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, receiverId],
            });
            await conversation.save();
        }

        res.status(201).json(conversation);

    } catch (error) {
        console.log("Error in createConversation controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getConversations = async (req, res) => {
    try {
        const loggedInUser = req.params; // Assuming receiverId is passed in body

        // const loggedInUser = req.user._id; 

        const conversations = await Conversation.find({
            participants: { $in: [loggedInUser] }
        }).populate("messages").populate("participants", "username"); // Also populating participant usernames

        res.status(200).json(conversations);

    } catch (error) {
        console.log("Error in getConversations controller", error.message);
        res.status(500).json({ error: "xx Internal server error" });
    }
};
