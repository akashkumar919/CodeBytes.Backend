import express from "express"
import verifyUser from "../middlewares/verifyUser.js";
const aiRouter = express.Router();
import aiChatting from "../controllers/aiChatting.js"

aiRouter.post('/chat',verifyUser,aiChatting);

export default aiRouter ;