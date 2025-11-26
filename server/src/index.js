// import express from "express";
// import cookieParser from "cookie-parser";
// import bodyParser from "body-parser";
// import {authRouter} from "./routes/authRouter.js"
// import problemRouter from "./routes/problemRouter.js";
// import submissionRouter from "./routes/userSubmitProblem.js";
// import contactRouter from "./routes/contactRouter.js";
// import aiRouter from "./routes/aiRouter.js";
// import videoRouter from "./routes/videoRouter.js";
// import googleRouter from "./routes/googleRouter.js";
// import cors from 'cors';

// const app = express();
// app.use(express.json());
// app.use(cookieParser());
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));

// // Add these headers BEFORE routes
// // Browsers me credentials allow karne ke liye:
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });


// app.use(cors({
//   // origin: "*" || "http://localhost:5173",   // frontend ka URL
//   // origin:"*",
//   origin:["http://localhost:5173"],
//   credentials: true
// }));


// // user route
// app.use("/user",authRouter);
// // problem route
// app.use("/problem",problemRouter);
// app.use("/submission",submissionRouter);

// // contact route for sending Mail to the Admin
// app.use("/userContact",contactRouter);

// // ai chatting route 
// app.use("/ai",aiRouter);

// // upload video router 
// app.use("/video",videoRouter);


// // login with google router 
// app.use("/googleAuth",googleRouter);



// export default app;










import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { authRouter } from "./routes/authRouter.js";
import problemRouter from "./routes/problemRouter.js";
import submissionRouter from "./routes/userSubmitProblem.js";
import contactRouter from "./routes/contactRouter.js";
import aiRouter from "./routes/aiRouter.js";
import videoRouter from "./routes/videoRouter.js";
import googleRouter from "./routes/googleRouter.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX 1: Proper CORS
app.use(
  cors({
    origin: ["http://localhost:5173","https://codebytess.netlify.app"],   // local
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ❗ FIX 2: Remove duplicate custom headers (CORS handle karega)
// Yaha koi extra header mat bhejo

// ALL ROUTES
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submissionRouter);
app.use("/userContact", contactRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);
app.use("/googleAuth", googleRouter);

export default app;
