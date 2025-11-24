import Problem from "../models/problemSchema.js";
import { getLanguageId,getSubmitResult,getStatusCode } from "../utils/problemUtility.js";
import Submission from "../models/submission.js";
import VideoSolution from "../models/solutionVideo.js";
// import Submission from "../models/submission.js";
// Admin Access 
const createProblem =async(req,res)=>{
    try{
        const {title,description,difficulty,tags,constraints,visibleTestCases,hiddenTestCases,startCode,submissionsCount,referenceSolution,problemCreator} = req.body;


        for(const {language,completeCode} of referenceSolution){

            // language ki ki Id nikalna 
            const languageId = getLanguageId(language);

            // all test cases ko ek batch main wrap krna 
            const submissions = visibleTestCases.map((testCases)=>({
                language_id : languageId,
                source_code : completeCode,
                stdin : testCases.input,
                expected_output : testCases.output
            }));

            // batch ko judge0 ko bhejna aur tokens ko receive krna
            const submitResult = await getSubmitResult(submissions);

            // sabhi tokens ko ek array main wrap krna
            const resultTokens = submitResult.map((items)=>items.token);

            // array of tokens ko judge0 ko bhejna aur sabhi tokens ke corresponding status code receive krna

            const statusCode = await getStatusCode(resultTokens);
            

           for(const test of statusCode){
            // console.log(test.status)
            
            if(test.status_id != 3){
                console.log("❌ Judge0 Failed:", test);
                return res.status(400).send(`Error Occurred! Test failed with status ${test.status.description}`);
            }
           }

        }

        const DsaProblem = await Problem.create({
            ...req.body,
            problemCreator : req.payload._id
        });
        if(!DsaProblem){
            return res.status(400).send("Problem is not created!");
        }

        console.log(DsaProblem)
        res.status(201).send("Problem created successfully!");

    }
    catch(err){
        res.status(400).send("Error: "+err.message)
    }
};

const updateProblem =async(req,res)=>{
    const {title,description,difficulty,tags,constraints,visibleTestCases,hiddenTestCases,startCode,submissionsCount,referenceSolution,problemCreator} = req.body;

    const id = (req.params.id);

    try{
        // check ID
        if(!id){
            return res.status(400).send("ID is missing!");
        }

        // check Problem in DB
        const DsaProblem = Problem.findById(id);
        if(!DsaProblem){
            return res.status(404).send("Problem not found!");
        }

        // reference solution se language aur completeCode ko extract krke batch prepare krna taki judge0 ko send kiya ja ske.
        for(const {language,completeCode} of referenceSolution){

            // language ki ki Id nikalna 
            const languageId = getLanguageId(language);

            // all test cases ko ek batch main wrap krna 
            const submissions = visibleTestCases.map((testCases)=>({
                language_id : languageId,
                source_code : completeCode,
                stdin : testCases.input,
                expected_output : testCases.output
            }));

            // batch ko judge0 ko bhejna aur tokens ko receive krna
            const submitResult = await getSubmitResult(submissions);

            // sabhi tokens ko ek array main wrap krna
            const resultTokens = submitResult.map((items)=>items.token);

            // array of tokens ko judge0 ko bhejna aur sabhi tokens ke corresponding status code receive krna
            const statusCode = await getStatusCode(resultTokens);


            // check weather the problem accepted or rejected
           for(const test of statusCode){
            // console.log(test.status)
            if(test.status_id != 3){
                return res.status(400).send("Error Occurred!");
            }
           }

        }

        // update the problem 
        const updatedProblem = await Problem.findByIdAndUpdate(id,{...req.body},
            {new: true,runValidators: true});
        if(!updatedProblem){
            return res.status(400).send("Problem is not updated!");
        }
        
        res.status(200).send("Problem is updated!");
        
    }
    catch(err){
        res.status(400).send("Error: "+err.message)
    }
};

const deleteProblem =async(req,res)=>{
    try{
       const id = (req.params.id);
       if(!id){
        return res.status(400).send("ID is missing!");
       }

       // check the problem in DB
       const DsaProblem  = await Problem.findById(id);
       if(!DsaProblem){
        return res.status(404).send("Problem is missing!");
       }

       // delete the problem 
       const deletedProblem = await Problem.findByIdAndDelete(id);
       if(!deletedProblem){
        return res.status(400).send("Problem is not deleted");
       }

       res.status(200).send("Problem is deleted!");
    }
    catch(err){
        res.status(400).send("Error: "+err.message)
    }
};

// User Access routes
const fetchAllProblem =async(req,res)=>{
    
    
    try {
    let { page = 1, limit = 15 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get problems with pagination
    const problems = await Problem.find({})
        .select("title _id difficulty tags submissionsCount acceptSubmissionsCount")
        .skip(skip)
        .limit(limit);

    const total = await Problem.countDocuments();

    if (problems.length === 0) {
        return res.status(404).json({ message: "No problems found!" });
    }

    res.status(200).json({
        problems, // ✅ frontend me `response.data.problems` use hoga
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
} catch (err) {
    res.status(500).json({ error:err.message });
}

};

const fetchOneProblem =async(req,res)=>{
    try{

        const id = req.params.id;
        if(!id){
            return res.status(400).send("Id is missing!");
        }

        const DsaProblem = await Problem.findById(id).select(' -createdAt -updatedAt -__v');
        if(!DsaProblem){
            return res.status(404).send("Problem is missing!");
        }

        // fetch the video solution of the problem
        const video = await VideoSolution.findOne({problemId:id});
        
        
        // if(video){

        //     DsaProblem.secureUrl = video.secureUrl;
        //     DsaProblem.thumbnailUrl = video.thumbnailUrl;
        //     DsaProblem.duration = video.duration;
        //     DsaProblem.uploadedAt = video.uploadedAt;
        //     DsaProblem.cloudinaryPublicId = video.cloudinaryPublicId;

        // //    console.log(DsaProblem.secureUrl)
        //     return res.status(200).send(DsaProblem);
        // }

        if (video) {
            const problemData = {...DsaProblem.toObject(),
            video: {
                secureUrl: video.secureUrl,
                thumbnailUrl: video.thumbnailUrl,
                duration: video.duration,
                uploadedAt: video.createdAt,
                cloudinaryPublicId: video.cloudinaryPublicId
            }
        };

    return res.status(200).send(problemData);
}



        return res.status(200).send(DsaProblem);

    }
    catch(err){
        return res.status(400).send("Error: ",err.message)
    }
};

const getAllSubmissionsOfAProblem = async (req,res)=>{
    try{
        const userId = req.user._id;
        const problemId = req.params.pid;
        const ans = await Submission.find({userId,problemId}).select("status runTime sourceCode language createdAt");
       
        if(ans.length === 0){
            return res.status(200).send("Problem submissions not found!");
        }
        return res.status(200).send(ans);
    }
    catch(err){
        return res.status(404).send("Error: "+err.message);
    }
}

const getAllSubmissionsOfAllProblems = async (req,res)=>{
   try{
        const userId = req.user._id;
        const ans = await Submission.find({userId}).select(" _id userId title status runTime ");
        if(ans.length == 0){
            return res.status(200).send("Problem submissions not found!");
        }
        return res.status(200).send(ans);
    }
    catch(err){
        return res.status(404).send("Error: "+err.message);
    }
}

export {createProblem,updateProblem,deleteProblem,fetchAllProblem,fetchOneProblem,getAllSubmissionsOfAProblem,getAllSubmissionsOfAllProblems};
