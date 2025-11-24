import express from "express"
const contactRouter = express.Router();
import verifyUser from "../middlewares/verifyUser.js";
import coolDown from "../middlewares/coolDown.js";
import rateLimiter from "../middlewares/rateLimiter.js";

//..................................................................//
import { sendMailToAdmin } from "../controllers/contact.js";



contactRouter.post("/contact",verifyUser,coolDown,rateLimiter,sendMailToAdmin);

export default contactRouter;