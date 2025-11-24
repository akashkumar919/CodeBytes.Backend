import jwt from "jsonwebtoken";
import User from "../models/user.js";
import 'dotenv/config';
import redisClient from "../config/redis.js";


const verifyUser = async(req,res,next)=>{

    try{

        const Access_token = req.cookies?.token;
        // console.log(Access_token)
        if(!Access_token){
            throw new Error("Token not found");
           
        }

         const isBlacklisted = await redisClient.exists(`token:${Access_token}`);
         
            if (isBlacklisted) {
                return res.status(400).json({ message: "Invalid Token" });
            }

        const payload = jwt.verify(Access_token,process.env.JWT_SIGN_KEY);
        
        // console.log(payload)
        //  const payload = jwt.decode(Access_token,process.env.JWT_SIGN_KEY);
       
        if(!payload){
            
            throw new Error("Invalid token!")
        }
        
        req.payload = payload;


        const user = await User.findById(payload._id);
        if(!user){
           return res.send("User not found!")
        }

        if(user.role != 'user'){
            return res.status(404).json({ error: "you are not user!" });
        }

        req.user = user;
            
        next();

    }
    catch(err){
        console.log(err)
        res.status(401).json({error:err.message});
    }

}




export default verifyUser;