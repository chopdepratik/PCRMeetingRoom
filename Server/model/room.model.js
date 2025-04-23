import mongoose from 'mongoose';

const roomSchema = mongoose.Schema({
    userName:{
        type:String,
    },
    hostName: {
        type: mongoose.Schema.ObjectId,
        ref:'Users'
    },
    roomId: {
        type: String,
        required: true
    }
});

const Room = mongoose.model('room', roomSchema);

export default Room;
