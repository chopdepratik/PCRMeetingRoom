import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import roomRouter from './router/room.route.js';
import userRouter from './router/user.route.js';
import dotenv from 'dotenv'
dotenv.config()

const app = express();
app.use(express.json());
app.use(cors());
 

const mongoURL = process.env.MONGO_URL
 
app.use("/api/v1/user",userRouter)
app.use("/api/v2/room", roomRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on('leaveRoom',({roomId, userName})=>{
    socket.leave(roomId)
    
    io.to(roomId).emit("leavedRoom", {userName});
  });

  socket.on('user-join', ({ roomId ,currectUser}) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { userId: socket.id, otherUser:currectUser});
  });

  socket.on('send-ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('receive-ice-candidate', { candidate, from: socket.id });
  });

  socket.on('send-offer', ({ offer, to }) => {
    socket.to(to).emit('receive-offer', { offer, from: socket.id });
  });

  socket.on('send-answer', ({ answer, to }) => {
    socket.to(to).emit('receive-answer', { answer, from: socket.id });
  });

   
   
  
  socket.on('endMeeting', ({ roomId }) => {
    // Get all sockets in the room
    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    
    if (roomSockets) {
      for (const socketId of roomSockets) {
        const s = io.sockets.sockets.get(socketId);
        if (s) {
          s.leave(roomId); // remove from room
          s.emit('meetingEnded'); // notify client
        }
      }
    }

    

    console.log(`Meeting with ID ${roomId} has ended`);
  });
  
});

mongoose.connect(mongoURL)
  .then(() => server.listen(5000))
  .then(() => console.log("Connected to MongoDB and Server running on port 5000"))
  .catch((err) => console.log(err));
