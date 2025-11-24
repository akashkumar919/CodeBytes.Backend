import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import {authRouter} from "./routes/authRouter.js"
import problemRouter from "./routes/problemRouter.js";
import submissionRouter from "./routes/userSubmitProblem.js";
import contactRouter from "./routes/contactRouter.js";
import aiRouter from "./routes/aiRouter.js";
import videoRouter from "./routes/videoRouter.js";
import googleRouter from "./routes/googleRouter.js";
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use(cors({
  origin: "*",   // frontend ka URL
  credentials: true
}));


// user route
app.use("/user",authRouter);
// problem route
app.use("/problem",problemRouter);
app.use("/submission",submissionRouter);

// contact route for sending Mail to the Admin
app.use("/userContact",contactRouter);

// ai chatting route 
app.use("/ai",aiRouter);

// upload video router 
app.use("/video",videoRouter);


// login with google router 
app.use("/googleAuth",googleRouter);







export default app;