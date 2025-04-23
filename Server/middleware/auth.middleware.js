import jwt from 'jsonwebtoken'
import User from '../model/user.model.js';
 
//const secret =process.env.secret_key this won't be accessible
 

export const createToken = (id, firstName)=>{
    const secret =process.env.SECRET_KEY // this will be accessible
    console.log(secret)
    
    const token = jwt.sign(
        {
            id,
            firstName
        },
        secret,
        {
            expiresIn: "2d",
        }

    )
    return token;
}

export const isAuthenticated = async(req, res, next)=>{
    const secret =process.env.SECRET_KEY 
    console.log(secret)
    try {
        const token = await req.headers.authorization?.split(" ")[1]

        if(!token){
            return res.status(401).json({
                success:false,
                isLogin:false,
                message:'Token missing'
            })
        }

        jwt.verify(token, secret,async(err, user)=>{
            if(err){
                return res.status(401).json({
                    success:false,
                    isLogin:false,
                    message:err.message
                })
            }

            console.log("is authenticate")
            req.user = await User.findById(user.id)
            console.log("is authenticate",req.user)
            next()
        })
    } catch (err) {
        return res.status(500).json({
            success:false,
            isLogin:false,
            message:err.message
        })
    }
}
