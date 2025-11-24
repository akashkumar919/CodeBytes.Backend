import express from "express";
const videoRouter = express.Router();
import verifyAdmin from "../middlewares/verifyAdmin.js";
import { getUploadDigitalSignature,deleteVideo,saveVideoMetaData } from "../controllers/videoUploadControl.js";


videoRouter.get('/getSignature/:id',verifyAdmin,getUploadDigitalSignature);
videoRouter.post('/saveMetaData',verifyAdmin,saveVideoMetaData);
videoRouter.delete('/deleteVideo/:id',verifyAdmin,deleteVideo);



export default videoRouter;