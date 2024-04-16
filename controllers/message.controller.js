// import { clearScreenDown } from "readline";
// import Conversation from "../models/conversation.model.js";
// import Message from "../models/message.model.js";
// import userModel from "../models/user.model.js";
// import jwt from "jsonwebtoken";

// export const sendMessage = async (req, res) => {
//     console.log("message sent", req.params.id)
//     try {
//         const { message } = req.body;//message content
//         const { id: receiverId } = req.params;//destructuring
//         // console.log("req" + req);
//         // console.log("message " + message);
//         // console.log("user " + req.user);

//         const senderId = req.user._id;

//         let conversation = await Conversation.findOne({
//             participants: { $all: [senderId, receiverId] },
//         });

//         if (!conversation) {//if conversation does not exist
//             conversation = await Conversation.create({
//                 participants: [senderId, receiverId],
//                 //default empty messages array
//             });
//         }

//         const newMessage = new Message({
//             senderId,
//             receiverId,
//             message,
//         });

//         if (newMessage) {
//             conversation.messages.push(newMessage._id);
//         }

//         await Promise.all([conversation.save(), newMessage.save()]);

//         //socket io functionality to add here

//         res.status(201).json(newMessage);

//     } catch (error) {
//         console.log("error in sent message controller", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     };
// };



// export const getMessages = async (req, res) => {
//     try {
//         const { id: userToChatId } = req.params;
//         const senderId = req.user._id;

//         const conversation = await Conversation.findOne({
//             participants: { $all: [senderId, userToChatId] },
//         }).populate("messages");//returns objects instead of ids

//         if (!conversation) {
//             return res.status(200).json([]);
//         }

//         const messages = conversation.messages;
//         res.status(200).json(messages);


//     } catch (error) {
//         console.log("error in sent message controller", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     };
// };

import { clearScreenDown } from "readline";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const sendMessage = async (req, res) => {
    console.log("message sent", req.params.id)
    try {
        const { message } = req.body;//message content
        const { id: receiverId } = req.params;//destructuring
        // console.log("req" + req);
        // console.log("message " + message);
        // console.log("user " + req.user);

        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {//if conversation does not exist
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                //default empty messages array
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        //socket io functionality to add here

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("error in sent message controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    };
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");//returns objects instead of ids

        if(!conversation){
            return res.status(200).json([]);
        }
        
        const messages=conversation.messages;
        res.status(200).json(messages);


    } catch (error) {
        console.log("error in sent message controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    };
};
