import redisClient from "../config/redis.js";


const windowSize = 60 ;  // Total time in seconds
const maxRequests = 6;  // max request that can be sent in 60 seconds

const rateLimiter = async (req,res,next)=>{

    try{

        const key = `IP:${req.ip}`;
        const current_time = Date.now()/1000;  // curr time in second bcz date gives time in milliseconds
        const window_time = current_time - windowSize;

        // remove all request before window size 
        await redisClient.zRemRangeByScore(key,0,window_time);

        // total number of requests present in window 
        const numberOfRequests =await redisClient.zCard(key);

        if(numberOfRequests>=maxRequests){
            throw new Error("Number of Requests Exceeded!");
        }

        // Request added into window 
        await redisClient.zAdd(key,[{score:current_time,value:`${current_time}:${Math.random()}`}])

        // key TTL hai usko increase krna 
        await redisClient.expire(key,windowSize);

        next();
    }
    catch(err){
        console.error("Rate limiter Error "+err.message)
        res.send("Error: "+ err);
    }
}


export default rateLimiter;