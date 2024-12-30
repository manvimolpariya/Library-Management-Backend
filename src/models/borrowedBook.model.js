import mongoose, { Mongoose } from "mongoose";

let borrowedBookSchema = new mongoose.Schema({
  UserID : {
    type : mongoose.Schema.Types.ObjectId,
     ref : "User"
  },
  Name :{
     type : String,
     ref : "User"
  },
  Role :{
     type : String,
     ref : "User"
  },
  BookID :{
    type : mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required : true
  },
  BookTitle :{
    type : String,
    ref: "Book",
    required : true
  },
  BorrowDate :{
    type : Date,
    required : true
  },
  ReturnDate : {
     type : Date,
     required : true
  },
 Penalty :{
    type : Number,
    required : true
  }
},{timestamps : true});

export const BorrrowedBook = mongoose.model('BorrrowedBook', borrowedBookSchema);