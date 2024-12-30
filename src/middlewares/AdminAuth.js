import jwt from "jsonwebtoken"

import { Admin } from "../models/admin.models.js"

export const adminAuthMiddle = async (req, res, next) =>{
  try {
     const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "")
      if(!token){
          return next({status : 404 , message :"Unauthorised request"})
      }
    const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
  
    const user = await Admin.findById(decodedToken?._id).select("-Password ")
   
    if(!user){
      return next({status : 401, message:"Invalid Token"})
    }
    req.user = user;
    next();
  } catch (error) {
    return next({status : 402, message : "error while logging out"})
  }
}