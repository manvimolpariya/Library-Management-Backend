import { User } from "../models/user.models.js";
import UserDTO from "../dto/user.dto.js";
import joi from "joi"
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const generateTokens = async (userId)=>{
 try {
    const user = await User.findById(userId);
  const accessToken =  user.generateAccessToken();
   const refreshToken = user.generateRefreshToken();
   user.refreshToken = refreshToken
 await  user.save({validateBeforeSave:false})
 return {accessToken, refreshToken}
 } catch (error) {
    return next(error)
 }
}
const register = async (req, res, next) =>{
    const userRegisterSchema = joi.object({
        Name : joi.string().max(30).required(),
        userName : joi.string().min(3).max(30).required(),
        Email : joi.string().email().required(),
        Password : joi.string().pattern(passwordPattern).required(),
        PhoneNo: joi.string().max(10).required(),
        role : joi.string().required(),
     });
     const {error} = userRegisterSchema.validate(req.body);
     if (error){
        return next(error);
        }
        const {Name, userName, Email, Password, PhoneNo, role} = req.body;
        try {
           let existUser = await User.findOne({
            $or :[{userName}, {Email}]
         })
         if(existUser){
            if(existUser.userName === userName){
                let error = {
                    status : 405 ,
                   message :  "username already exist..choose different username"
                }
                    return next(error);
                }
                else if(existUser.Email === Email){

                    let error = {
                        status : 408,
                        message : "email already exist..choose different email"
                    }
                        return next(error);
                }
         }
         const user = await User.create({
            Name,
            Email,
            userName,
            Password,
            PhoneNo,
            role,
            refreshToken : ""
         })
         const createUser = await User.findById(user._id).select('-password -refreshToken');
         if(!createUser){
            return next({status : 404 , data : "user dose not exist"});
        }
        const userDto = new UserDTO(createUser);
        return res.status(201).json({createUser : userDto, auth : true})
        } catch (error) {
            return next(error)
        }
}

const  login= async (req, res, next)=>{
   
    const userLoginSchema = joi.object({
        userName : joi.string().min(3).max(30).required(),
        Password : joi.string().pattern(passwordPattern).required(),
     });
     const {error} = userLoginSchema.validate(req.body);
     if (error){
        return next(error);
        }
      const  {userName, Password} = req.body;
      //console.log(userName)
      let errorMsg;
      try {
        let user = await User.findOne({ userName:userName})
      
        if(!user){
            errorMsg = {
                status : 401,
                message : "username might be incorrect"
            }
            return next(errorMsg);
        }
       const isPasswordValid = await user.isPasswordCorrect(Password);
          if(!isPasswordValid){
            errorMsg = {
                status : 401,
                message : "password might be incorrect"
            }
            return next(errorMsg);
           }

         const {accessToken, refreshToken} =  await generateTokens(user._id)
         const LoggedInUser = await User.findById(user._id).select("-Password -refreshToken")
         const options ={
            httpOnly : true,
            secure : true
         }
         
         return  res.status(200).cookie("accessToken", accessToken, options).cookie('refreshToken', refreshToken, options).json({user : LoggedInUser , auth : true})
      } catch (error) {
        return next(error);
      }
}
const logout =async (req, res, next) =>{
    try {
         User.findById(req.user._id,{
            $set :{refreshToken : ""}
         })
         const options ={
            httpOnly : true,
            secure : true
         }
         return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken", options).json({message : "user Logout", auth : false})
    } catch (error) {
        return next(error)
    }
     
}
const fullUpdate = async (req, res, next) =>{
    const userId = req.user?._id;

  const {Name, userName, Email, Password, PhoneNo, role}  = req.body;
   try {
   const oldPassword =  await User.findOne(userId);
    const userRegisterSchema = joi.object({
        Name : joi.string().max(30).required(),
        userName : joi.string().min(3).max(30).required(),
        Email : joi.string().email().required(),
        Password : joi.string().pattern(passwordPattern).required(),
        PhoneNo: joi.string().max(10).required(),
        role : joi.string().required(),
     });
     const {error} = userRegisterSchema.validate(req.body);
     if (error){
        return next(error);
        }
       oldPassword.Password = Password ;
        oldPassword.save({validateBeforeSave : false})
    const updateUser = await User.findByIdAndUpdate( userId , {Name : Name, userName : userName, Email : Email, PhoneNo : PhoneNo, role : role })
     if(!updateUser){
        let error = {
            status : 403,
            message : "User records not updated !!!"
        }
        return next(error);
     }
     const findUser = await User.findOne(updateUser._id).select("-Password ")
     const userDto = new UserDTO(findUser);
     return res.status(201).json({createUser : userDto, auth : true})

} catch (error) {
     return next(error)
   }
}
const updateName = async (req, res,next) =>{

  try {
      const UserSchema =  joi.object({
          Name : joi.string().max(30).required(),
       });
       const {error} = UserSchema.validate(req.body);
     if (error){
        return next(error);
        }
       const {Name} = req.body;
       const findUser = await User.findOne(req.user?._id);
       if(!findUser){
        let error = {
            status : 404,
            message : "please login first"
        }
        return next(error)
       }
       findUser.Name = Name 
     await  findUser.save({validateBeforeSave : false})
    const updateName = await User.findOne(findUser._id).select("-Password");
    const updateUserDTO = new UserDTO(updateName);
    return res.status(200).json({updateUser : updateUserDTO ,auth : true});
    
  } catch (error) {
     return next(error)
  }
}
const updateUserName = async (req, res,next) =>{
    try {
         const userSchema = joi.object({
            userName : joi.string().min(3).max(30).required(),
            Email : joi.string().required()
         })
         const {error} = userSchema.validate(req.body);
         if (error){
            return next(error);
            }
            const {userName, Email} = req.body;
            const findUser = await User.findOne({Email});
            if(!findUser){
                let error = {
                    status : 404,
                    message : "invalid email"
                }
                return next(error)
            }
           findUser.userName = userName ;
          await findUser.save({validateBeforeSave : false});
          const user = await User.findOne(findUser._id).select("-Password");
        const updatedUserName = new UserDTO(user);
        return res.status(201).json({ user : updatedUserName ,auth : true})
    } catch (error) {
        return next(error)
    }
}
const updatePassword = async (req, res,next) =>{
    try {
        const UserSchema =  joi.object({
            Password : joi.string().max(30).required(),
            Email : joi.string().required()
         });
         const {error} = UserSchema.validate(req.body);
       if (error){
          return next(error);
          }
         const {Password, Email} = req.body;
         const findUser = await User.findOne({Email});
         if(!findUser){
          let error = {
              status : 404,
              message : "Invalid Email"
          }
          return next(error)
         }
          findUser.Password = Password;
         const updateuser = await findUser.save({validateBeforeSave : false});
         const updatePasswordUser = await User.findOne(updateuser._id).select("-Password");
         const updateUser = new UserDTO(updatePasswordUser);
         return res.status(200).json({user : updateUser ,auth : true});
        } 
        catch(e){
            return next(e)
        }
}
const updateEmail = async (req, res,next) =>{
    try {
        const UserSchema =  joi.object({
            Email : joi.string().max(30).required(),
         });
         const {error} = UserSchema.validate(req.body);
       if (error){
          return next(error);
          }
         const {Email} = req.body;
         const findUser = await User.findOne(req.user?._id);
         if(!findUser){
          let error = {
              status : 404,
              message : "please login first"
          }
          return next(error)
         }
         findUser.Email = Email
       await  findUser.save({validateBeforeSave : false})
      const updateEmail = await User.findOne(findUser._id).select("-Password");
      const updateUserDTO = new UserDTO(updateEmail);
      return res.status(200).json({updateUserEmail : updateUserDTO ,auth : true});
      
    } catch (error) {
       return next(error)
    }
}
const updatePhoneNo = async (req, res,next) =>{
    try {
        const UserSchema =  joi.object({
            PhoneNo : joi.string().max(30).required(),
         });
         const {error} = UserSchema.validate(req.body);
       if (error){
          return next(error);
          }
         const {PhoneNo} = req.body;
         const findUser = await User.findOne(req.user?._id);
         if(!findUser){
          let error = {
              status : 404,
              message : "please login first"
          }
          return next(error)
         }
         findUser.PhoneNo = PhoneNo
       await  findUser.save({validateBeforeSave : false})
      const updatePhoneNo= await User.findOne(findUser._id).select("-Password");
      const updateUserDTO = new UserDTO(updatePhoneNo);
      return res.status(200).json({updateUserPhoneNumber : updateUserDTO ,auth : true});
      
    } catch (error) {
       return next(error)
    }
}
const updateRole = async (req, res,next) =>{
    try {
        const UserSchema =  joi.object({
            role : joi.string().max(30).required(),
         });
         const {error} = UserSchema.validate(req.body);
       if (error){
          return next(error);
          }
         const {role} = req.body;
         const findUser = await User.findOne(req.user?._id);
         if(!findUser){
          let error = {
              status : 404,
              message : "please login first"
          }
          return next(error)
         }
         findUser.role = role
       await  findUser.save({validateBeforeSave : false})
      const updaterole= await User.findOne(findUser._id).select("-Password");
      const updateUserDTO = new UserDTO(updaterole);
      return res.status(200).json({updateUserRole : updateUserDTO ,auth : true});
      
    } catch (error) {
       return next(error)
    }
}
export  {register,
           login,
           logout, 
           fullUpdate, 
           updateName, 
           updateUserName, 
           updatePassword, 
           updateEmail, 
           updatePhoneNo, 
           updateRole
        }