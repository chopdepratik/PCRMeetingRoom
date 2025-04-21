import express from 'express';
import { createRoom, joinRoom } from '../controller/room.controller.js';

const roomRouter = express.Router();

roomRouter.post('/createroom', createRoom);
roomRouter.post('/joinroom', joinRoom);

export default roomRouter;
