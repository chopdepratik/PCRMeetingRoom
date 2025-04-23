import Room from "../model/room.model.js";
import { v4 as uuid } from 'uuid';

export const createRoom = async (req, res) => {
    const { userName } = req.body;
    const {_id} = req.user._id
    const roomId = uuid();

     

    const existingRoom = await Room.findOne({ roomId });

    if (existingRoom) {
        return res.status(400).json({
            success:false,
            message: 'Room already exists, please try again',
        });
    }

    await Room.create({ userName,hostName:_id, roomId });
     

    return res.status(201).json({
        success:true,
        message: 'Room created successfully',
        roomId,
    });
};

export const joinRoom = async (req, res) => {
     try {
        const { roomId } = req.body;

        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                success:false,
                message: 'Room does not exist, please check roomId',
            });
        }

        return res.status(200).json({
            success:true,
            message: 'Joined room successfully',
            roomId,
        });
     } catch (error) {
        console.log(error)
        console.error("error: ",error.message)
     }
};


export const getHost = async(req,res)=>{
    try {
        const {roomId} = req.body
        console.log(roomId)

        const room = await Room.findOne({roomId}).populate('hostName')
     
        if(!room){
            return res.status(404).json({
                success:false,
                message:"Room does not exist"
            })
        }

        res.status(200).json({
            success:true,
            message:'Host found ',
            host:room
        })
    } catch (error) {
        console.log("error from gethost bc",error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}