import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { Console } from "console";

const verifyAdmin = async(req,res,next)=>{
    try{
   
           const Access_token = req.cookies?.token;
          
           if(!Access_token){
               throw new Error("Token not found");
           }
           const payload = jwt.verify(Access_token,process.env.JWT_SIGN_KEY);
        //    const payload = jwt.decode(Access_token,process.env.JWT_SIGN_KEY);
           if(!payload){
               throw new Error("Invalid token!")
           }
           
           req.payload = payload;
           
           const user = await User.findById(payload._id);
           if(!user){
               res.send("User not found!")
            }
            
           
            if(user.role != "admin"){
            throw new Error("Invalid token!");
           }
   
           next();
   
       }
       catch(err){
        
           res.send("Error: "+err.message);
       }
}


export default verifyAdmin;