import { Book } from "../models/book.models.js";
import Joi  from "joi";
import fs from 'fs';
import BookDTO from "../dto/Book.dto.js";
const addBook = async (req, res, next) =>{
    const bookSchema = Joi.object({
        Image : Joi.string().optional(),
        Title  : Joi.string().min(3).required(),
        Author : Joi.string().min(3).required(),
        Gengre : Joi.string().min(3).required(),
        PublicationYear : Joi.number().required(),
        TotalCopies : Joi.number().required(),
        AvailableCopies : Joi.number().required()
    });
    const {error} = bookSchema.validate(req.body);
    if (error){
       return next(error);
       }
    try {
        const { Title, 
                Author, 
                Gengre, 
                PublicationYear, 
                TotalCopies, 
                AvailableCopies} = req.body;
               const existBook = await Book.findOne({Title})
               if(existBook){
                let error ={
                   status : 303,
                   message : "book already uploaded !!!!"
                }
                  return next(error);
               }
            const  bookName =`${req.file.originalname}`
           // console.log(bookName);
            if(!bookName){
                let error =  {
                    status : 404,
                    message : "upload image"
                }
                            return next(error);
             }
             const bookAdd = await Book.create({
                Image : bookName, 
                Title, 
                Author, 
                Gengre, 
                PublicationYear, 
                TotalCopies, 
                AvailableCopies
             })
           const findBook = await Book.findOne(bookAdd._id)
           if(!findBook){
            let error = {
                status  : 403,
                message : " book not find"
            }
            return next(error);
           }
           let bookObject = new BookDTO(findBook);
           return res.status(200).json({user : bookObject , auth : true})
              
    } catch (error) {
        return next(error);
    }
}
const updateBookImage = async (req, res, next) =>{
     const updateBookImageSchema = Joi.object({
        Image : Joi.any().required()
     })
     const { error } = updateBookImageSchema.validate( {Image : req.file});
     if(error){
        return next(error);
     }
     const updateBookCover = await Book.findByIdAndUpdate(req.params._id, {
        $set : { Image : `${req.file.originalname}`}
     })
     if(!updateBookCover){
        let error = {
            status : 404,
            message : "book cover can't updated successfully"
        }
        return next(error);
     }
     const user = await Book.find({_id :updateBookCover._id});
     if(!user){
      const error ={
        status : 403,
        message  : "fail image updation"
      }
      return next(error);
     }
     return res.status(200).json({ UpdateBook : user , auth : true})
}
const updateBook = async (req, res, next) =>{
    const bookSchema = Joi.object({
        Image : Joi.string().optional(),
        Title  : Joi.string().min(3).optional(),
        Author : Joi.string().min(3).optional(),
        Gengre : Joi.string().min(3).optional(),
        PublicationYear : Joi.number().optional(),
        TotalCopies : Joi.number().optional(),
        AvailableCopies : Joi.number().optional()
    });
    const {error} = bookSchema.validate(req.body);
    if (error){
       return next(error);
       }
    try {
        const { Title, 
                Author, 
                Gengre, 
                PublicationYear, 
                TotalCopies, 
                AvailableCopies} = req.body;
        const findBook = await Book.findByIdAndUpdate(req.params._id, {
            Title ,
                Author, 
                Gengre, 
                PublicationYear, 
                TotalCopies, 
                AvailableCopies
        })
        if(!findBook){
            let error = {
                status : 405,
                message : "update book can't successfull"
            }
            return next(error)
        }
        const book = await Book.find(findBook._id)
        return res.status(200).json({ book : book , auth : true})
} catch(e){
   return next(e)
}
}
const deleteBook = async (req, res, next) =>{
    try {
         const findBook = await Book.findByIdAndDelete(req.params._id);
         if(!findBook){
            let error = {
                status : 404,
                message : "no such type of book exist ...!!"
            }
            return next(error)
         }
          return res.status(200).json({ book : "deleted" ,auth : true})
    } catch (error) {
          return next(error)
    }
}
const AllBooksDetaile = async (req, res, next) =>{
   try {
      const books = await Book.find()
      if(!books){
        let error = {
            status : 404,
            message : "not find"
        }
        return next(error)
      }
      return res.status(200).json({ BooksDetails : books, auth : true})
   } catch (error) {
     return next(error)
   }
}
const searchBook = async (req, res, next) =>{
try {
    const bookSchema = Joi.object({
        Title  : Joi.string().min(3).optional(),
        Author : Joi.string().min(3).optional(),
        Gengre : Joi.string().min(3).optional(),
        PublicationYear : Joi.number().optional(),
    });
    const {error} = bookSchema.validate(req.body);
    if (error){
       return next(error);
       }

        const { Title, 
                Author, 
                Gengre, 
                PublicationYear, 
               } = req.body;
            
               const findBook = await Book.find( {$or : [{Title}, {Author}, {Gengre} , {PublicationYear}]})
               if(findBook.length == 0){
                let error = {
                    status : 404,
                    message : "not find"
                }
                return next(error)
               }
               return res.status(201).json({book : findBook , auth : true})
} catch (error) {
     return next(error)
}
 }
export { 
    addBook,
    updateBook,
    updateBookImage,
    deleteBook,
    AllBooksDetaile,
    searchBook
}