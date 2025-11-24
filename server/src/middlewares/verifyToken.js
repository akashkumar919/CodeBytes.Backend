import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

const verifyToken = async (req,res,next)=>{
    try{

        const Access_token = req.cookies.token;
                
        if(!Access_token){
            throw new Error("Login first!");
        }
        
        const payload = jwt.verify(Access_token,process.env.JWT_SIGN_KEY);
        
        
        if(!payload){
            throw new Error("Invalid token!")
        }
        req.payload = payload;

        // check the  token validity
        const IsBlocked = await redisClient.exists(`token:${Access_token}`);

        if(IsBlocked)
            throw new Error("Invalid Token")

        next();
    }
    catch(err){
        res.status(404).send("Error: "+err.message);
    }
}



export default verifyToken;