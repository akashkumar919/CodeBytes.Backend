import express from "express"
const authRouter = express.Router();
import { register,login,updateUser,logout,userInfo,adminRegister,deleteUserProfile,getLeaderboard,getImageUploadSignature,saveImageMetaData} from "../controllers/userAuth.js";
import { forgotPasswordOTP, resetPasswordUsingOTP } from "../controllers/userAuth.js"
import verifyUser from "../middlewares/verifyUser.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";
import verifyUserOrAdmin from "../middlewares/verifyUserOrAdmin.js";
import rateLimiter from "../middlewares/rateLimiter.js";
import coolDown from "../middlewares/coolDown.js";
import { userAuthenticating } from "../controllers/userAuth.js";


//register admin
authRouter.post("/admin/register",verifyAdmin,adminRegister);
// register user 
authRouter.post("/register",register);
// login user
authRouter.post("/login",login);
// update user
authRouter.put("/update",verifyUserOrAdmin,updateUser);

// logout user
authRouter.post("/logout",verifyUserOrAdmin,logout);
// fetch one user Info
authRouter.get("/info",rateLimiter,coolDown,verifyToken,userInfo);
// fetch all user Info
authRouter.get("/allUserInfo",verifyToken,getLeaderboard);
// delete user 
authRouter.delete("/deleteUser",verifyUser,deleteUserProfile);
// for user Authenticating
authRouter.get("/check",verifyUserOrAdmin,userAuthenticating);


authRouter.get('/getImageSignature',verifyUserOrAdmin,getImageUploadSignature);
authRouter.post('/saveImageMetaData',verifyUserOrAdmin,saveImageMetaData);







// forgot password 

authRouter.post("/forgot-password-otp", forgotPasswordOTP);
authRouter.post("/reset-password-otp", resetPasswordUsingOTP);




export {authRouter}
