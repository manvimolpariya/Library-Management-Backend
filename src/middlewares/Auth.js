import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"

export const authMiddle = async (req, res, next) =>{
  try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
      if(!token){
          return next({status : 404 , message :"Unauthorised request"})
      }
    const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-Password -refreshToken")
    if(!user){
      return next({status : 401, message:"Invalid Token"})
    }
    req.user = user;
    next();
  } catch (error) {
    return next({status : 402, message : "error while logging out"})
  }
}