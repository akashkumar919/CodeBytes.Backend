import mongoose from 'mongoose';
const { Schema } = mongoose;
import Submission from './submission.js';

const userSchema = new Schema({
    
    firstName:{
        type:String,
        minLength:3,
        maxLength:20,
        trim:true,
        uppercase:true, 
        required:true,
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
        trim:true,
        uppercase:true,
    },
    email:{
        type:String,
        unique:[true,"Email already exist"],
        required:true,
        lowercase:true,
        trim:true,
        immutable:true,
    },
    gender : {
    type : String,
    enum : ["male","female","other"],
  
   },
   password : {
    type : String,
    minLength : 8,
    maxLength : 100,
    trim : true,

   },
   role:{
    type:String,
    enum:["user","admin"],
    default:"user",
   },
   problemSolved:{
       type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
       }
    ]

    },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  points: {
        type: Number,
        default: 0,
  },
  age:{
    type:Number,
    default:18
  },
  city:{
    type:String,
    trim:true
  },
  country:{
    type:String,
    trim:true,
  },
  college:{
    type:String,
    trim:true
  },
  githubId:{
    type:String,
    minLength:3,
    maxLength:100,
    trim:true,
  },
  linkedInId:{
    type:String,
    minLength:3,
    maxLength:100,
    trim:true,
  },
  photo:{
    type:String,
    trim:true,
    default:'https://res.cloudinary.com/djsxyiw6n/image/upload/v1763634308/anonymous_mczbig.webp'
  },
  language:{
    type:[{
        type:String,
        
    }]
  },
skills:{
    type:[{
        type:String,
        
    }]
},

},

{ timestamps: true }
)

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
        await mongoose.model('submission').deleteMany({userId:userInfo._id});
       
    }
});

const User = mongoose.model('user', userSchema);

export default User;











// import mongoose from 'mongoose';
// const { Schema } = mongoose;

// const userSchema = new Schema(
//   {
//     firstName: {
//       type: String,
//       minLength: 3,
//       maxLength: 20,
//       trim: true,
//       uppercase: true,
//       required: true,
//     },

//     lastName: {
//       type: String,
//       minLength: 3,
//       maxLength: 20,
//       trim: true,
//       uppercase: true,
//     },

//     email: {
//       type: String,
//       unique: [true, "Email already exist"],
//       required: true,
//       lowercase: true,
//       trim: true,
//       immutable: true,
//     },

//     gender: {
//       type: String,
//       enum: ["male", "female", "other"],
//     },

//     // 👇 NEW FIELD FOR GOOGLE LOGIN
//     googleId: {
//       type: String,
//       default: null,
//     },

//     password: {
//       type: String,
//       required: function () {
//         return !this.googleId;    // ✔ Normal users ke liye password required
//       },
//       minLength: 8,
//       maxLength: 100,
//       trim: true,
//     },

//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },

//     problemSolved: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "problem",
//       },
//     ],
//   },
//   { timestamps: true }
// );

// userSchema.post('findOneAndDelete', async function (userInfo) {
//     if (userInfo) {
//         await mongoose.model('submission').deleteMany({userId:userInfo._id});
       
//     }
// });

// const User = mongoose.model('user', userSchema);

// export default User;