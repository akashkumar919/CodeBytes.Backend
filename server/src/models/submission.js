import mongoose from "mongoose";
import { Schema } from "mongoose";


const submissionSchema = Schema({
   
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        
    },
    problemId:{
        type:Schema.Types.ObjectId,
        ref:'problem',
       
    },
    status:{
        type:String,
        
    },
    language:{
        type:String,
        enum:['java','javascript','c','c++','c#','python']
    },
    totalTestCases:{
        type:Number,
        default:0
    },
    passTestCases:{
        type:Number,
        default:0

    },
    errorMessage:{
        type:String,
        trim:true,

    },
    sourceCode:{
        type:String,
    },
    runTime:{
        type:Number,

    },
    memory:{
        type:Number,

    }
},{timestamps:true});

submissionSchema.index({userId:1,problemId:1});

const Submission = mongoose.model("submission",submissionSchema);

export default Submission;