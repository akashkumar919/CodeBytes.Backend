import VideoSolution from "../models/solutionVideo.js";
import { v2 as cloudinary } from 'cloudinary';
import { configDotenv } from "dotenv";
import Problem from "../models/problemSchema.js";



cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key:process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});


// This is for digital signature
const getUploadDigitalSignature = async (req,res)=>{
    
    const userId = req.payload._id;
    const problemId = req.params.id;
    try{
        const problem = await Problem.findById(problemId);
        if(!problem){
            return res.status(404).json({message:"problem not found!"});
        }

        // Time stamp and digital public Id
        const timestamp = Math.round(new Date().getTime() / 1000);
        const publicId = `codeBytes_solution/${problemId}/${userId}_${timestamp}`;

        // upload parameters
        const uploadParams = {
            timestamp:timestamp,
            public_id: publicId
        };

        // generate signature
        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.API_SECRET
        );

        // RESPONSE SEND 

        res.status(200).json({
            signature,
            timestamp,
            public_id:publicId,
            api_key:process.env.API_KEY,
            cloud_name:process.env.CLOUD_NAME,
            upload_url:`https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/video/upload`
        })
    }
    catch(err){
        console.error('error generating upload signature',err);
        res.status(500).json({err:'failed to generate upload signature!'})
    }
}


// This is for save Video meta data
const saveVideoMetaData = async (req,res)=>{

    const {
        problemId,
        cloudinaryPublicId,
        secureUrl,
        duration
    } = req.body;
    const userId = req.payload._id;
     try{
        // verify the upload with cloudinary
        const cloudinaryResources = await cloudinary.api.resource(
            cloudinaryPublicId,
            {resource_type:'video'}
        );

        if(!cloudinaryResources){
            return res.status(400).json({error : 'video not found on cloudinary!'})
        };

        // check if video  already exists for this problem and user in database 
        const existingVideo = await VideoSolution.findOne({userId,problemId,cloudinaryPublicId});
        if(existingVideo){
            return res.status(409).json({error:'video already exist in database!'});
        }

        // generate thumbnail url 
        
        const thumbnailUrl = cloudinary.url(cloudinaryResources.public_id, {
            resource_type: "video",
            format: "jpg",
            transformation: [
                {
                    width: 400,
                    height: 225,
                    crop: "fill",
                    quality: "auto",
                    start_offset: "auto"
                }
            ]
        });



        // create video solution record 
        const videoSolution = new VideoSolution({
            userId,
            problemId,
            cloudinaryPublicId,
            duration:cloudinaryResources.duration || duration,
            secureUrl,
            thumbnailUrl,
             
        })

        await videoSolution.save();



        res.status(201).json({
            videoSolution:{
                thumbnailUrl:videoSolution.thumbnailUrl,
                id:videoSolution._id,
                duration:videoSolution.duration,
                uploadedAt:videoSolution.createdAt,
            },
            message:"video solution saved successfully!"
        })


    }
    catch(error){
        console.error(error ,'Error saving video meta data');
        res.status(400).json({error:'Failed to save video meta data'})
    }
}



// This is for deleting video 
const deleteVideo = async (req,res)=>{
    
    const problemId = req.params.id;
    
    const userId = req.payload._id;
     try{
        const video = await VideoSolution.findOneAndDelete({problemId:problemId});
        if(!video){
            return res.status(404).json({
                error:'video not found!'
            });
        }

        await cloudinary.uploader.destroy(video.cloudinaryPublicId,{resource_type:'video' ,invalidate:true});

        res.status(200).json({message:'video deleted successfully!'});
    }
    catch(error){
        console.error(error,'Failed to delete video');
        console.log(error)
        return res.status(404).json({error:'Failed to delete video'})
    }
}


export {saveVideoMetaData,deleteVideo,getUploadDigitalSignature};