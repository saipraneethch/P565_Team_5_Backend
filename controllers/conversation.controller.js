import { clearScreenDown } from "readline";
import Conversation from "../models/conversation.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const createConversation = async (req, res) => {
    try {
        // const {participants } = req.body; 

        const participants = req.body.participants.map(id => new mongoose.Types.ObjectId(id));

        const senderId = req.user._id; // Logged-in user's ID
        console.log("sender id test", senderId);
        // Check if a conversation already exists between these participants

        // let conversation = await Conversation.findOne({
        //     participants: { $all: [senderId, ...participants] }
        // });
        let exactParticipants = [senderId, ...participants];

        let conversation = await Conversation.findOne({
            participants: {
                $all: exactParticipants,
                $size: exactParticipants.length
            }
        });

        // Create a new conversation if it does not exist
        if (!conversation) {
            conversation = new Conversation({
                participants: [...participants, senderId],
                groupChat: participants.length > 1,
            });

            await conversation.save();
            conversation = await conversation.populate({
                path: 'participants',
                select: 'first_name last_name'
            }); //.execPopulate()
        }
        else {
            conversation = await Conversation.findById(conversation._id).populate({
                path: 'participants',
                select: 'first_name last_name'
            });
        }

        res.status(201).json(conversation);

    } catch (error) {
        console.log("Error in createConversation controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getConversations = async (req, res) => {
    try {
        const { id: userId } = req.params;//destructuring


        console.log("user id test", userId);
        const conversations = await Conversation.find({
            participants: { $in: [userId] }
        }).populate('messages').populate({
            path: 'participants',
            select: 'first_name last_name'
        });

        // const conversations = await Conversation.find({
        //     participants: { $in: [userId] }
        // }).populate("participants");


        console.log("conversations from controller", conversations);
        res.status(200).json(conversations);

        console.log('convos', conversations);
    } catch (error) {
        console.log("Error in getConversations controller", error.message);
        res.status(500).json({ error: "xx Internal server error" });
    }
};
