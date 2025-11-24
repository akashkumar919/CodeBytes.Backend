import mongoose from 'mongoose';
const { Schema } = mongoose;

const problemSchema = Schema({

    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    difficulty:{
        type:String,
        required:true,
        enum:["Easy","Medium","Hard"],
    },
    tags: {
        type: [String],  // Example: ["array", "dp", "binary search"]
        default: [],
        trim:true
    },
    constraints: {
        type: [String],  // Example: ["1 <= n <= 10^5", "Array contains positive integers only"]
        default: [],
        trim:true
    },
    visibleTestCases:[
        {    
            input:{
                type:String,
                required:true,
                trim:true
            },
            output:{
                type:String,
                required:true,
                trim:true
            },
            explanation:{
                type:String,
                trim:true
                
            }
        }
    ],
    hiddenTestCases:[
        {    
            input:{
                type:String,
                required:true,
                trim:true
            },
            output:{
                type:String,
                required:true,
                trim:true
            }
        }
    ],
    startCode:[
        {
            initialCode:{
                type:String,
                required:true,
                trim:true
            },        
            language:{
                type:String,
                required:true,
                trim:true
            },
        }
    ],
    submissionsCount: {
        type: Number,
        default: 0,
    },
    acceptSubmissionsCount:{
        type:Number,
        default:0
    },
    referenceSolution:[
        {
            language:{
                type:String,
                required:true,
                trim:true,
            },
            completeCode:{
                type:String,
                required:true,
                trim:true,
            }
        }
    ],
    problemCreator:{
        type:Schema.Types.ObjectId,
        ref:"user",
        trim:true,
        required:true,
    }
    
},
{timestamps:true}
);

const Problem = mongoose.model("problem",problemSchema);

export default Problem;


