
import mongoose from "mongoose";

let BookSchema = new mongoose.Schema({
  Image :{
    required : true,
    type : String
  },
  Title : {
    required : true,
    type : String
  },
  Author :{
    type : String,
    required : true
  },
  Gengre :{
    type : String,
    required : true
  },
  PublicationYear :{
    type : Number,
    required : true
  },
  TotalCopies : {
     type : Number,
     required : true
  },
  AvailableCopies :{
    type : Number,
    required : true
  }
},{timestamps : true});

export const Book = mongoose.model('Book', BookSchema);