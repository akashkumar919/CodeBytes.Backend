import mongoose from "mongoose";

import { Schema } from "mongoose";

const videoSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    problemId:{
        type:Schema.Types.ObjectId,
        ref:'problem',
        required:true
    },
    cloudinaryPublicId:{
        type:String,
        required:true,
        unique:true,
    },
    secureUrl:{
        type:String,
        required:true
    },
    thumbnailUrl:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,
        required:true
    }
},
{ timestamps: true }
);

const VideoSolution = mongoose.model("solutionVideo",videoSchema);

export default VideoSolution;