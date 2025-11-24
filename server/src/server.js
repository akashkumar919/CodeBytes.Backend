import main from "./config/db.js";
import app from "./index.js"
import 'dotenv/config';
import redisClient from "./config/redis.js";


async function serverConnect(){
    try{    
        await Promise.all([
            redisClient.connect(),
            main()
        ])
        console.log("Redis and  DB is Connected")

        app.listen(process.env.PORT,()=>{
            console.log(`server is listening at port ${process.env.PORT}`)
        }) 
    }
    catch(err){
        console.log("Error: "+err);
    }
}




serverConnect();