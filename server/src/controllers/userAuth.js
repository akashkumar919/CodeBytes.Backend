import User from "../models/user.js";
import userValidation from "../validators/userValidation.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";
import validator from "validator";
import redisClient from "../config/redis.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { generateSecureOTP } from "../utils/generateOTP.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const register = async (req, res) => {
  try {
    // user validation
    userValidation(req.body);

    // hashing password
    req.body.password = await bcrypt.hash(req.body.password, 10);

    req.body.role = "user";
    // create user
    const user = await User.create(req.body);

    const reply = {
      
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      problemSolved: user.problemSolved,
      points: user.points,
      age: user.age,
      city: user.city,
      githubId: user.githubId,
      linkedInId: user.linkedInId,
      country: user.country,
      college: user.college,
      skills: user.skills,
      photo: user.photo,
      language: user.language,
      email: user.email,
      _id: user._id,
      role: user.role,
      createdAt: user.createdAt,
    };

    // create jwt token
    const Token = jwt.sign(
      { _id: user._id, email: req.body.email, role: "user" },
      process.env.JWT_SIGN_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", Token, {
      maxAge: 60 * 60 * 1000,
      // secure: true, 
      // sameSite: "strict", 
      httpOnly: true,
      secure: true,        // Render = MUST
      sameSite: "none",    // CORS + credentials = MUST
    });

    return res.status(201).json({
      success: true,
      user: reply,
      message: "User registered successfully!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error occurred!",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format!",
      });
    }

    const user = await User.findOne({ email }).populate("problemSolved");
    console.log(user)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email!",
      });
    }

    const isAllowed = await bcrypt.compare(password, user.password);
    if (!isAllowed) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password!",
      });
    }

    const reply = {
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      problemSolved: user.problemSolved,
      points: user.points,
      age: user.age,
      city: user.city,
      githubId: user.githubId,
      linkedInId: user.linkedInId,
      country: user.country,
      college: user.college,
      skills: user.skills,
      photo: user.photo,
      language: user.language,
      email: user.email,
      _id: user._id,
      role: user.role,
      createdAt: user.createdAt,
    };

    const Token = jwt.sign(
      { _id: user._id, email, role: user.role },
      process.env.JWT_SIGN_KEY,
      { expiresIn: "24h" }
    );

    res.cookie("token", Token, {
      maxAge: 24 * 60 * 60 * 1000,
      // httpOnly: true,
      // secure: true,
      // sameSite: "strict",
      httpOnly: true,
      secure: true,        // Render = MUST
      sameSite: "none",    // CORS + credentials = MUST
    });

    return res.status(200).json({
      success: true,
      user: reply,
      message: "User logged in successfully!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error occurred!",
    });
  }
};

const logout = async (req, res) => {
  try {
    const Access_token = req.cookies?.token;

    await redisClient.set(`token:${Access_token}`, "Blocked");
    await redisClient.expireAt(`token:${Access_token}`, req.payload.exp);

    res.cookie("token", null, { maxAge: 0 });

    return res.status(200).json({
      success: true,
      message: "user logout successfully!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server error occurred!",
    });
  }
};
// get one user information
const userInfo = async (req, res) => {
  try {
    if (!req.payload._id) {
      return res.status(400).json({
        message: "There is no ID!",
      });
    }
    const user = await User.findById(req.payload._id).populate("problemSolved").select(
      "-role -password -createdAt -updatedAt -__v -otp -otpExpires"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//update user

const updateUser = async (req, res) => {
  try {
    const userId = req.user._id; // JWT ya session se aayega
    const data = req.body;

    // Email change allowed nahi hai ❌
    if (data.email) {
      delete data.email;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    }).populate("problemSolved").select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all user information

const getLeaderboard = async (req, res) => {
  try {
    // Users ko points ke descending order me fetch karna
    const users = await User.find({})
      .sort({ points: -1, problemSolved: -1 }) // tie-breaker: jo zyada problems solve kare
      .select("firstName lastName photo points problemSolved role");
    const user = users.filter((u, i) => u.role === "user");
    // Rank assign karna
    let rank = 1;
    let prevPoints = null;
    let sameRankCount = 0;

    const leaderboard = user.map((u, index) => {
      if (prevPoints !== null) {
        if (u.points === prevPoints) {
          sameRankCount++;
        } else {
          rank += sameRankCount + 1;
          sameRankCount = 0;
        }
      }
      prevPoints = u.points;

      return {
        rank: rank,
        firstName: u.firstName,
        lastName: u.lastName,
        photo: u.photo,
        email: u.email,
        points: u.points,
        problemsSolved: u.problemSolved,
        role: u.role,
      };
    });

    res.status(200).json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const adminRegister = async (req, res) => {
  try {
    // user validation
    userValidation(req.body);

    // hashing password
    req.body.password = await bcrypt.hash(req.body.password, 10);

    req.body.role = "admin";
    // create user
    const user = await User.create(req.body);

    // res.cookie("token",Token,{maxAge:60*60*100});
    res.status(201).json({
      message: "Admin registered successfully!",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteUserProfile = async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.user._id).select(
      "_id firstName lastName email problemSolved"
    );

    if (!deleteUser) {
      return res.status(404).json({
        message: "User not found!",
      });
    }
    return res.status(200).json({
      data: deleteUser,
      message: "User deleted Successfully!",
    });
  } catch (err) {
    res.status(404).send("Error: " + err.message);
  }
};

const userAuthenticating = async (req, res) => {
  try {
    const user = req.user;
    const reply = {
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      problemSolved: user.problemSolved,
      points: user.points,
      age: user.age,
      city: user.city,
      githubId: user.githubId,
      linkedInId: user.linkedInId,
      country: user.country,
      college: user.college,
      skills: user.skills,
      photo: user.photo,
      language: user.language,
      email: user.email,
      _id: user._id,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      user: reply,
      message: "Valid user!",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginWithGoogle = async (req, res) => {
  try {
    const { firstName, email, photo } = req.body;
  
    let user = await User.findOne({ email });

    // ✅ New Google User
    if (!user) {
      user = await User.create({
        firstName,
        email,
        photo,
      });
    }

     // create jwt token
    const Token = jwt.sign(
      { _id: user._id, email: req.body.email, role: "user" },
      process.env.JWT_SIGN_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", Token, {
      maxAge: 60 * 60 * 1000,
      // secure: true, // HTTPS ke liye (production only)
      // sameSite: "strict", // CSRF se protection
      httpOnly: true,
      secure: true,        // Render = MUST
      sameSite: "none",    // CORS + credentials = MUST
    });

    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    return res.status(404).json({
      message: "Login failed",
    });
  }
};

// STEP 1 — SEND OTP
export const forgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Email not registered" });

    const otp = generateSecureOTP();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Send OTP via email
    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP is ${otp}. It is valid for 5 minutes.`
    );

    res.json({ message: "OTP sent to your email!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// STEP 2 — VERIFY OTP + RESET PASSWORD
export const resetPasswordUsingOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({ message: "Password changed successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update user Photo
const getImageUploadSignature = async (req, res) => {
  console.log("hello");
  const userId = req.payload._id;
  const timestamp = Math.round(new Date().getTime() / 1000);

  const publicId = `codeBytes_profile/${userId}_${timestamp}`;

  const uploadParams = {
    timestamp,
    public_id: publicId,
  };

  const signature = cloudinary.utils.api_sign_request(
    uploadParams,
    process.env.API_SECRET
  );

  return res.json({
    signature,
    timestamp,
    public_id: publicId,
    api_key: process.env.API_KEY,
    upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`,
  });
};
// save Image meta data
const saveImageMetaData = async (req, res) => {
  console.log("hiii");
  const { secureUrl, cloudinaryPublicId } = req.body;
  const userId = req.payload._id;

  try {
    // verify image
    const cloudRes = await cloudinary.api.resource(cloudinaryPublicId, {
      resource_type: "image",
    });

    await User.findByIdAndUpdate(
      userId,
      { photo: cloudRes.secure_url },
      { new: true }
    );

    res.json({
      message: "Profile photo updated!",
      url: cloudRes.secure_url,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to save metadata" });
  }
};

export {
  register,
  login,
  logout,
  userInfo,
  adminRegister,
  deleteUserProfile,
  userAuthenticating,
  loginWithGoogle,
  getLeaderboard,
  updateUser,
  getImageUploadSignature,
  saveImageMetaData,
};
