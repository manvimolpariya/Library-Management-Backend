import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
let UsersSchema = new mongoose.Schema({
  Name : {
    required : true,
    type : String
  },
  userName : {
    required : true,
    type : String
  },
  Email :{
    type : String,
    required : true
  },
  Password :{
    type : String,
    required : true
  },
  PhoneNo :{
    type : Number,
    required : true
  },
  role : {
     type : String,
     required : true
  },
  refreshToken:{
    type : String,
  }
},{timestamps : true});

UsersSchema.pre("save", async function (next) {
   if(!this.isModified("Password")) return next();
  this.Password = await bcrypt.hash(this.Password, 10)
  next()
})
UsersSchema.methods.isPasswordCorrect = async function (password) {
 return await bcrypt.compare(password, this.Password)
}
UsersSchema.methods.generateAccessToken = function(){
  return jwt.sign({ _id : this._id,
    userName : this.userName,
  Email : this.Email,
  Name : this.Name
 },process.env.ACCESS_TOKEN_SECRET,
{
  expiresIn : process.env.ACCESS_TOKEN_EXPIRY
})
}
UsersSchema.methods.generateRefreshToken = function(){
  return jwt.sign({ _id : this._id,
  
   },process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn : process.env.REFRESH_TOKEN_EXPIRY
  })
}
export const User = mongoose.model('User', UsersSchema);