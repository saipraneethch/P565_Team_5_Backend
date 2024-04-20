import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    // groupId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Conversation",
    //     required: false
    // },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: false
    },
    message:{
        type: String,
        required: true
},
//createdAt, updatedAt fields added by mongoose
},{timestamps: true});

const Message = mongoose.model('Message', messageSchema);

export default Message;

