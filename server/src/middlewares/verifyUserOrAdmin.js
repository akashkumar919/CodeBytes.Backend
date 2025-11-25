import jwt from "jsonwebtoken";
import User from "../models/user.js";
import redisClient from "../config/redis.js";

const verifyUserOrAdmin = async(req,res,next)=>{
    try{
   
           const Access_token = req.cookies?.token;
           
           if(!Access_token){
               throw new Error("Token not found");
           }


            const isBlacklisted = await redisClient.exists(`token:${Access_token}`);
            if (isBlacklisted) {
                return res.status(400).json({ message: "Invalid Token" });
            }
         
           const payload = jwt.verify(Access_token,process.env.JWT_SIGN_KEY);
            //   const payload = jwt.decode(Access_token,process.env.JWT_SIGN_KEY);
          
           if(!payload){
               throw new Error("Invalid token!")
           }
           
           req.payload = payload;

           const user = await User.findById(payload._id).populate("problemSolved");

           if(!user){
               return res.send("User not found!")
           }

            req.user = user;
            
           next();
          
   
       }
       catch(err){
        
           res.send("Error: "+err.message);
       }
}


export default verifyUserOrAdmin;