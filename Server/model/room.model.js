import mongoose from 'mongoose';

const roomSchema = mongoose.Schema({
    hostName: {
        type: String,
        required: true
    },
    roomId: {
        type: String,
        required: true
    }
});

const Room = mongoose.model('room', roomSchema);

export default Room;
