import validator from 'validator';

export default function userValidation(data){

    
    const mandatoryFields = ["firstName","email","password"];
    // const result = mandatoryFields.every((value)=>{Object.keys(data).includes(value)});
    const result = mandatoryFields.every((value)=> Object.keys(data).includes(value));

    if(!result){
        return res.json({
            success:false,
            message:"Some fields are missing"
        })
    }

    if(!validator.isEmail(data.email)){
        return res.json({
            success:false,
            message:'Invalid email!'
        })
    }

    if(!validator.isLength(data.firstName,{min:3,max:20})){
        return res.json({
            success:false,
            message:"First name required min 3 char and max 20 char!"
        })
    }
   
    if(!validator.isStrongPassword(data.password,
        { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})){
        return res.json({
        success:false,
        message:'Weak password'
       })
    }

}