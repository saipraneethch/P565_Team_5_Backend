import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [//type array
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    messages: [//array
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: [],
        }
    ],
    groupChat: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;