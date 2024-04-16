import { clearScreenDown } from "readline";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
// import { idText } from "typescript";

export const sendMessage = async (req, res) => {
    // console.log("message sent", req.params.id)
    try {
        const { recipients, message } = req.body;//message content
        // console.log("req" + req);
        // console.log("message " + message);
        // console.log("user " + req.user);

        if (!recipients || !message) {
            return res.status(400).json({ error: 'Recipients and message are required' });
        }

        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, ...recipients] },
        });

        if (!conversation) {//if conversation does not exist
            conversation = await Conversation.create({
                groupChat: true,
                participants: [senderId, ...recipients],
                //default empty messages array
            });
        }

        const newMessage = new Message({
            senderId,
            recipients,
            message,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("error in sent message controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    };
};

export const getMessages = async (req, res) => {
    try {
        const { id: groupConversationId } = req.params;
        // const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            _id: groupConversationId,
            // participants: senderId,
        }).populate("messages");//returns objects instead of ids

        if (!conversation) {
            return res.status(200).json([]);
        }

        const messages = conversation.messages;
        res.status(200).json(messages);

    } catch (error) {
        console.log("error in sent message controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    };
};

export const getGroupConversations = async (req, res) => {
    try {
        const { id: userId } = req.params;
        // const senderId = req.user._id;

        const conversations = await Conversation.find({
            participants: { $in: [userId] },
            // participants: senderId,
        }).populate("participants");

        // .populate("participants")
        return res.status(200).json(conversations);


    } catch (error) {
        console.log("error in sent message controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    };
};

//todo
export const createGroupChat = async (req, res) => {
    try {
        // Extract the participants from the request body
        const { participants: givenParticipants } = req.body;


        // Create the group chat in the database
        const groupChat = await Conversation.create({
            participants: [...givenParticipants],
            //add group chat true?
            //default empty messages array
        });

        // Return the created group chat as a response
        res.status(201).json(groupChat);
    } catch (error) {
        console.error('Error creating group chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


