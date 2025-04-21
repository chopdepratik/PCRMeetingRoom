import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import roomRouter from './router/room.route.js';
import dotenv from 'dotenv'

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config()

const mongoURL = process.env.mongoUrl

app.use("/api/v2/room", roomRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on('user-join', ({ roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { userId: socket.id, roomId });
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
});

mongoose.connect(mongoURL)
  .then(() => server.listen(5000))
  .then(() => console.log("Connected to MongoDB and Server running on port 5000"))
  .catch((err) => console.log(err));
