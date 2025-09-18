import express from 'express'
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
const router = express.Router();
const generateToken = (userId)=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:"15d"});
}
router.post("/register",async(req,res)=>{
    try{
        const {username,email,password} = req.body;
        if(!username||!email||!password){
            return res.status(400).json({message:"All fields are required"});
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters"});
        }
        if(username.length<3){
            return res.status(400).json({message:"Username must be at least 3 characters"});
        }
       const existingEmail = await User.findOne({email});
       if(existingEmail){
           return res.status(400).json({message:"Email already exists"});
       }
       const existingUsername = await User.findOne({username});
       if(existingUsername){
           return res.status(400).json({message:"Username already exists"});
       }
       const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
       const user = new User({username,email,password,profileImage});
       await user.save();
       const token = generateToken(user._id);
       res.status(201).json({
        token,
        user:{
            _id:user._id,
            username:user.username,
            email:user.email,
            profileImage:user.profileImage,
        },
         });
    }catch(error){
        console.error("Error in register route:", error);
        return res.status(500).json({message:"Internal server error"});
    }
});
router.post("/login",async(req,res)=>{
    try{
        const {email,password}= req.body;
        if(!email||!password)return res.status(400).json({message:"All fields are required"});
        const user = await User.findOne({email});
        if(!user)return res.status(400).json({message:"Invalid credentials"});
        const isMatch = await user.comparePassword(password);
        if(!isMatch)return res.status(400).json({message:"Invalid credentials"});
        const token = generateToken(user._id);                                                                                                                                                                                  
        res.status(200).json({
            token,
            user:{
                _id:user._id,
                username:user.username,
                email:user.email,
                profileImage:user.profileImage,
            },
        });
    }catch(error){
        console.error("Error in login route:", error);
        return res.status(500).json({message:"Internal server error"});
    }
});
export default router;
