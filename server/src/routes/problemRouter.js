import express from "express"
const problemRouter = express.Router();
import {createProblem,updateProblem,deleteProblem,fetchAllProblem,fetchOneProblem,getAllSubmissionsOfAProblem,getAllSubmissionsOfAllProblems} from "../controllers/problemAuth.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";
import verifyUser from "../middlewares/verifyUser.js";
import verifyUserOrAdmin from "../middlewares/verifyUserOrAdmin.js";





// admin access routes
// for creating problem
problemRouter.post("/create",verifyAdmin,createProblem);
// for updating problem
problemRouter.put("/update/:id",verifyAdmin,updateProblem);
// for deleting problem
problemRouter.delete("/delete/:id",verifyAdmin,deleteProblem);


// // user access routes
problemRouter.get("/allProblem",verifyUserOrAdmin,fetchAllProblem);// isme ham pagination laga skte hai
problemRouter.get("/oneProblem/:id",verifyUserOrAdmin,fetchOneProblem);
problemRouter.get("/getSubmission/:pid",verifyUser,getAllSubmissionsOfAProblem) // get all submissions of particular problem submitted by the user 
problemRouter.get("/getSubmission",verifyUser,getAllSubmissionsOfAllProblems) // ek particular user dwara submit ki gayi sari problems ko fetch krna



export default problemRouter;

