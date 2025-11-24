import express from "express"
const submissionRouter = express.Router();
import { submitProblem,getSolvedProblemByUser,runProblemByUser} from "../controllers/submittedProblem.js";
import verifyUser from "../middlewares/verifyUser.js";
import coolDown from "../middlewares/coolDown.js";
import rateLimiter from "../middlewares/rateLimiter.js";



submissionRouter.post("/submitProblem/:id",rateLimiter,coolDown,verifyUser,submitProblem);
submissionRouter.post("/runProblem/:id",rateLimiter,coolDown,verifyUser,runProblemByUser);
submissionRouter.get("/getSolvedProblem",verifyUser,getSolvedProblemByUser);// fetch all problems that are solved by the user 

export default submissionRouter;