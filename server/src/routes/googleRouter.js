import express from "express"
const googleRouter = express.Router();
import { loginWithGoogle } from "../controllers/userAuth.js";


googleRouter.post("/google/login",loginWithGoogle);



export default googleRouter;