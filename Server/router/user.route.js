import express from 'express'
import { isLogin, loginUser, registerUser } from '../controller/user.controller.js'
import { isAuthenticated } from '../middleware/auth.middleware.js';

const userRouter = express.Router()

userRouter.post('/registeruser',registerUser);
userRouter.post('/loginuser',loginUser)
userRouter.get('/isloginuser',isAuthenticated,isLogin)

export default userRouter;