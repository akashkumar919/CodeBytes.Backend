import Problem from "../models/problemSchema.js";
import Submission from "../models/submission.js";
import { getLanguageId,getStatusCode,getSubmitResult } from "../utils/problemUtility.js";
import User from '../models/user.js';



// This is for submit and run the problem in the database
const submitProblem = async(req,res)=>{

    const userId = req.payload._id;
    const problemId = req.params.id;
    const language = req.body.language;
    const sourceCode = req.body.code;
    

    if(!userId || !problemId || !language || !sourceCode){
        return res.status(400).send('some fields are missing!');
    }

    const DsaProblem = await Problem.findById(problemId);

    if(!DsaProblem){
        return res.status(404).send("problem not in DB")
    }

    try{
        // user problem ko run hone se phle hi save kra do jisse user apni problem ko dekh ske in future

        const submittedProblem =  await Submission.create({
            userId,
            problemId,
            language,
            sourceCode,
            errorMessage:'',
            status:'pending'
        })

        
            // language ki ki Id nikalna 
            const languageId = getLanguageId(language);

            // all test cases ko ek batch main wrap krna 
            const submissions = DsaProblem?.hiddenTestCases?.map((testCases)=>({
                language_id : languageId,
                source_code : sourceCode,
                stdin : testCases.input,
                expected_output : testCases.output
            }));

            // batch ko judge0 ko bhejna aur tokens ko receive krna
            const submitResult = await getSubmitResult(submissions);

            // sabhi tokens ko ek array main wrap krna
            const resultTokens = submitResult.map((items)=>items.token);

            // array of tokens ko judge0 ko bhejna aur sabhi tokens ke corresponding status code receive krna

            const statusCode = await getStatusCode(resultTokens);
            

            // judge0 dhwara bheje gaye tokens ke result ko de-structure krke usme se important information ko nikalna aur submission problem main save krana 
            let memory = 0;
            let runTime = 0;
            let totalPassedTessCases = 0;
            let status = 'Accepted';
            let errorMessage = '';
            let AcceptProblem = true;
                      

            for(const result of statusCode){

                if(result.status_id == 3){
                    runTime = runTime+parseFloat(result.time);
                    memory = Math.max(memory,result.memory);
                    totalPassedTessCases++;
                    errorMessage = null;
                }
                if(result.status_id == 4){
                    status = 'Wrong Answer';
                    errorMessage = result.stderr;
                    AcceptProblem = false;

                }
                if(result.status_id == 5){
                    status = 'Time Limit Exceeded';
                    errorMessage = result.stderr;
                    AcceptProblem = false;
                }
                if(result.status_id == 6){
                    status = 'Compilation Error';
                    errorMessage = result.stderr;
                    AcceptProblem = false;
                }
                if(result.status_id > 6){
                    status = 'Runtime Error';
                    errorMessage = result.stderr;
                    AcceptProblem = false;
                }
            }

            // user se ki gayi submit problem ko update kr do jo ki judge0 ne result diya hai
            submittedProblem.status = status;
            submittedProblem.runTime = runTime;
            submittedProblem.memory = memory;
            submittedProblem.errorMessage = statusCode.stderr;
            submittedProblem.passTestCases = totalPassedTessCases;
            submittedProblem.totalTestCases = DsaProblem.hiddenTestCases.length;
            
             await submittedProblem.save();  // save submission problem

            
            // // submission problem ko user schema ke solvedProblem field main save krana jab wo accept huyi ho tab hi vrna nhi krana!
            // if(AcceptProblem && !req.user.problemSolved.includes(problemId)){
            //     req.user.problemSolved.push(problemId);



            //     await req.user.save()
            // }

            //  //problem ko sabhi user dwara submit krne pr kitni bar wo accept huyi hai 
            // if(AcceptProblem){
            //     DsaProblem.acceptSubmissionsCount++;
            // }
            // // jab problem ko submit krte hai to uski submission count krna ki total kitni bar ye problem submit ki gayi hai.
            // DsaProblem.submissionsCount++;
            // await DsaProblem.save();


        if (AcceptProblem) {
            // User problemSolved array update
            if (!req.user.problemSolved.includes(problemId)) {
                req.user.problemSolved.push(problemId);

                // Points calculation based on problem difficulty
                let pointsToAdd = 0;
                switch(DsaProblem.difficulty) { // DsaProblem schema me difficulty field honi chahiye: 'Easy', 'Medium', 'Hard'
                    case 'Easy':
                        pointsToAdd = 1;
                        break;
                    case 'Medium':
                        pointsToAdd = 2;
                        break;
                    case 'Hard':
                        pointsToAdd = 3;
                    break;
                }

                req.user.points += pointsToAdd;
                await req.user.save();
            }

            // Problem acceptance count update
            DsaProblem.acceptSubmissionsCount++;
        }
         // jab problem ko submit krte hai to uski submission count krna ki total kitni bar ye problem submit ki gayi hai.
        DsaProblem.submissionsCount++;
        await DsaProblem.save();

           
        
        res.status(201).json({
            accepted :submittedProblem.status,
            errorMessage:submittedProblem.errorMessage,
            memory:submittedProblem.memory,
            runTime:submittedProblem.runTime,
            totalTestCases:submittedProblem.totalTestCases,
            totalPassedTessCases:submittedProblem.passTestCases,
            message:"Problem submitted successfully!"});
       
    }
    catch(err){
        res.status(500).json({
            message:err.message
        });
    }
}




// This is for finding all problems that are solved by the user
const getSolvedProblemByUser = async(req,res)=>{
    try{
        
        const user = await User.findById(req.payload._id).populate({
            path:'problemSolved',
            select:'_id createdAt runTime language status title difficulty'
        })
        if(!user){
            return res.status(404).json({
                message:"Problem not found!"
            });
        }
        return res.status(200).json({
            solvedProblem:user.problemSolved,
            message:'success'
        });
    }
    catch(err){
        return res.status(404).json({
            message:err.message
        });
    }
}






// This is for run the code 
const runProblemByUser = async(req,res)=>{
   try{
    
        const userId = req.payload._id;
        const problemId = req.params.id;
        const language = req.body.language;
        const sourceCode = req.body.code;
        console.log(sourceCode);
    

        if(!userId || !problemId || !language || !sourceCode){
            return res.status(400).send('some fields are missing!');
        }

        const DsaProblem = await Problem.findById(problemId);

        if(!DsaProblem){
            return res.status(404).send("problem not in DB")
        }
            // language ki ki Id nikalna 
            const languageId = getLanguageId(language);

            // all test cases ko ek batch main wrap krna 
            const submissions = DsaProblem?.visibleTestCases?.map((testCases)=>({
                language_id : languageId,
                source_code : sourceCode,
                stdin : testCases.input,
                expected_output : testCases.output
            }));

            // batch ko judge0 ko bhejna aur tokens ko receive krna
            const submitResult = await getSubmitResult(submissions);

            // sabhi tokens ko ek array main wrap krna
            const resultTokens = submitResult.map((items)=>items.token);

            // array of tokens ko judge0 ko bhejna aur sabhi tokens ke corresponding status code receive krna

            const statusCode = await getStatusCode(resultTokens);
            
           


            let memory = 0;
            let runTime = 0;
            let totalPassedTessCases = 0;
            let status = 'Accepted';
            let errorMessage = '';
            

            for(const result of statusCode){

                if(result.status_id == 3){
                    runTime = runTime+parseFloat(result.time);
                    memory = Math.max(memory,result.memory);
                    totalPassedTessCases++;
                    errorMessage = null;
                }
                if(result.status_id == 4){
                    status = 'Wrong Answer';
                    errorMessage = result.stderr;
                   

                }
                if(result.status_id == 5){
                    status = 'Time Limit Exceeded';
                    errorMessage = result.stderr;
                   
                }
                if(result.status_id == 6){
                    status = 'Compilation Error';
                    errorMessage = result.stderr;
                    
                }
                if(result.status_id > 6){
                    status = 'Runtime Error';
                    errorMessage = result.stderr;
                    
                }
            }
        
            res.status(201).json({
                success:status,
                runtime:runTime,
                memory:memory,
                testCases:statusCode
            });
       
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}





export {submitProblem,getSolvedProblemByUser,runProblemByUser};