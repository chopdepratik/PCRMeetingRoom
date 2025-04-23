import express from 'express';
import { createRoom, getHost, joinRoom } from '../controller/room.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const roomRouter = express.Router();

roomRouter.post('/createroom', isAuthenticated, createRoom);
roomRouter.post('/joinroom', joinRoom);
roomRouter.post('/gethost',getHost)

export default roomRouter;
