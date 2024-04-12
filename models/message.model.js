import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

    },
    receiverId: {//for direct messages
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    recipients: [{//for group chats
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    message: {
        type: String,
        required: true
    },
    //createdAt, updatedAt fields added by mongoose
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;

