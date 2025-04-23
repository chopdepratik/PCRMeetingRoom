import { createToken } from '../middleware/auth.middleware.js';
import User from '../model/user.model.js'

export const registerUser = async(req,res)=>{
    try{
        const {firstName, lastName, email, password} = req.body
        
        
        const existingUser = await User.findOne({email:email});

        if(existingUser){
            return res.status(400).json({
                success:true,
                message:"User exist with same email, plz change the mail id"
            })
        }

       await User.create({
            firstName,
            lastName,
            email,
            password
        })

        return res.status(201).json({
            success:true,
            message:"User register successfully"
        })

    }catch(err){
        console.error("Register Error:", err)
        res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

         
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist, please check the email id"
            });
        }

        if (password !== user.password) {
            return res.status(400).json({
                success: false,
                message: "Password does not match"
            });
        }

       
        const token = await createToken(user._id, user.firstName);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token: token
        });
    } catch (err) {
        console.log('Error:', err); // Log any error that occurs in the try block
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const isLogin = async(req, res)=>{
    try {
        const user = await User.findById(req.user._id)

        if(!user){
            return res.status(404).json({
                success:true,
                islogin:false
            })
        }

        res.status(201).json({
            success:true,
            islogin:true,
            user
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}