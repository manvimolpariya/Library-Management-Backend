import { BorrrowedBook } from "../models/borrowedBook.model.js"
import { Book } from "../models/book.models.js";
import { User } from "../models/user.models.js";
import { ReturnBorrowedBook } from "../models/return.model.js";
const borrowBook = async( req, res, next) =>{
 try {
    const {_id } = req.params
    const searchBook = await Book.findById({_id})
    if(!searchBook){
        let error = {
            status : 404,
            message : "book not find..!!!"
        }
        return next(error)
    }
    if(searchBook.AvailableCopies <= 0){
        let error ={
             status : 405,
            message : "currently no book available...!!"
        }
        return next(error)
    }
    searchBook.AvailableCopies = searchBook.AvailableCopies - 1
     const borrowDurationDays = 14; // Example: 2 weeks
     const dueDate = new Date();
     dueDate.setDate(dueDate.getDate() + borrowDurationDays);
    
     const currentDate = new Date();
     const overdueDays = (currentDate - dueDate) / (1000 * 60 * 60 * 24);
   
     let penalty = overdueDays > 0 ? overdueDays * 10 : 0;
      penalty = Math.floor(penalty)
     await searchBook.save();
     const findUser = await User.findById(req.user._id);

     if(!findUser){
        let error = {
            status : 404,
            message : "user not find..!!!"
        }
        return next(error)
    }
     const bookBorrowed = await BorrrowedBook.create({
        UserID : findUser._id,
        Name : findUser.Name,
        Role : findUser.role,
        BookID : searchBook._id,
        BookTitle : searchBook.Title,
        BorrowDate : currentDate,
        ReturnDate : dueDate,
        Penalty : penalty
     })
     if(!bookBorrowed){
        let error = {
            status : 404,
            message : "book borrow failed!!!"
        }
        return next(error)
     }
     return res.status(200).json({borrowDetails : bookBorrowed, auth : true})
//     console.log(searchBook)
//    console.log(searchBook.AvailableCopies)
//     console.log(dueDate)
//     console.log(penalty)
 } catch (error) {
    return next(error)
 }
}
const borrowBookDetails = async (req, res, next) =>{
try {
    const {Name} = req.body
    const findUser = await BorrrowedBook.find({Name})
    if(!findUser){
        let error = {
            status : 404,
            message : `no book issued by ${Name}!!!`
        }
       
        return next(error)
    }
    const penaltyDetails = findUser.map((data) => {
        const currentDate = new Date(); // Get today's date dynamically
        const dueDate = new Date(data.ReturnDate); // Due date from the database
  
        // Calculate overdue days dynamically
        const overdueDays = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
  
        // Calculate penalty dynamically, only if overdue
        const penalty = overdueDays > 0 ? overdueDays * 10 : 0;
      //  console.log(penalty)
  
        // Return the updated data object with calculated penalty
        return {
          ...data.toObject(), // Convert Mongoose document to plain object
          Penalty: Math.floor(penalty), // Add dynamic penalty
        };
      });
   // console.log(findUser)
    res.status(200).json(penaltyDetails);
} catch (error) {
    return next(error)
}
}
const returnborrowBook = async (req, res, next) =>{
      try {
         const {Name, BookTitle, Role} = req.body
         if(!Name || !BookTitle || !Role){
            let error = {
                status : 404,
                message : "Name BookeTitle and Role are required ... !!!!"
            }
            return next(error)
         }
         const user = await BorrrowedBook.find({Name, BookTitle, Role})
         if(!user){
            let error = {
                status : 404,
                message : "no user found"
            }
            return next(error)
         }
         
         const penaltyDetails = user.map((data) => {
            const currentDate = new Date(); // Get today's date dynamically
            const dueDate = new Date(data.ReturnDate); // Due date from the database
      
            // Calculate overdue days dynamically
            const overdueDays = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
      
            // Calculate penalty dynamically, only if overdue
            const penalty = overdueDays > 0 ? overdueDays * 10 : 0;
          //  console.log(penalty)
      
            // Return the updated data object with calculated penalty
            return {
              ...data.toObject(), // Convert Mongoose document to plain object
              Penalty: Math.floor(penalty), // Add dynamic penalty
            };
          }); 
          if(!penaltyDetails){
            let error = {
                status : 404,
                message : "no user found"
            }
            return next(error)
          }
          let  firstPenalty = {}
          if (penaltyDetails.length > 0) {
             firstPenalty = penaltyDetails[0];
            console.log(firstPenalty);
          } else {
           error = { status : 500, message : "something went wrong"}
           return next(error)
          }
         const latestdate = new Date().toDateString()
         const returnUser =  await ReturnBorrowedBook.create({
            UserID :firstPenalty.User,
            Name : firstPenalty.Name ,
            Role: firstPenalty.Role ,
            BookID : firstPenalty.BookID,
            BookTitle : firstPenalty.BookTitle ,
            BorrowDate : firstPenalty.BorrowDate,
            ReturnDate :firstPenalty.ReturnDate , 
            Penalty : firstPenalty.Penalty,
            Returned  : latestdate
      });
          
         if(!returnUser){
            let error = {
                status : 404,
                message : "return can't happend successfully"
            }
            return next(error)
          }
          const bookFind = await Book.findOne({Title : BookTitle});

          if(!bookFind){
            let error = {
                status : 404,
                message : "Book not found"
            }
            return next(error)
          }
          if(bookFind.AvailableCopies < bookFind.TotalCopies){
            bookFind.AvailableCopies =  bookFind.AvailableCopies + 1
          }
         else{
         let error = {
                satuts : 404,
                message : "invalid number of copies"
            }
            return next(error)
         }
         await bookFind.save()
         await BorrrowedBook.findByIdAndDelete(user[0]._id)
      
         return res.status(200).json({user : returnUser, auth : true})
      } catch (error) {
        return next(error)
      }
}
export {
    borrowBook,
    borrowBookDetails,
    returnborrowBook
}