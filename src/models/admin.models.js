
import mongoose from "mongoose";
let AdminSchema = new mongoose.Schema({
  Email : {
    type : String,
    required : true
  },
  Password : {
    type : String,
    required : true
  }
},)
export const Admin = mongoose.model('Admin', AdminSchema);