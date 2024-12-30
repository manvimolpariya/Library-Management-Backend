import { Router } from "express";
import { register , login, logout, fullUpdate, updateName, updateUserName, updatePassword, updateEmail, updatePhoneNo, updateRole} from "../controllers/user.controller.js";
import { authMiddle } from "../middlewares/Auth.js";
import upload from "../middlewares/storage.js";
import { addBook, AllBooksDetaile, deleteBook, searchBook, updateBook, updateBookImage } from "../controllers/book.controller.js";
import { AdminLogIn, AdminLogOut, AdminRegister } from "../controllers/admin.controller.js";
import { adminAuthMiddle } from "../middlewares/AdminAuth.js";
import { borrowBook, borrowBookDetails, returnborrowBook } from "../controllers/borrowbook.controller.js";
const router = Router()
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(authMiddle, logout);
router.route("/updateUser").put(authMiddle, fullUpdate);
router.route("/updateName").patch(authMiddle, updateName);
router.route("/updateUserName").patch(updateUserName);
router.route("/updatePassword").patch(updatePassword);
router.route("/updateEmail").patch(authMiddle, updateEmail);
router.route("/updatePhoneNo").patch(authMiddle, updatePhoneNo);
router.route("/updateRole").patch(authMiddle, updateRole);
router.route("/BookAdd").post(adminAuthMiddle, upload.single('Image'), addBook)
router.route("/AdminLogout").get(adminAuthMiddle, AdminLogOut)
router.route("/AdminLogin").post(AdminLogIn)
router.route("/AdminRegister").post(AdminRegister);
router.route("/UpdateBookImage/:_id").patch(adminAuthMiddle, upload.single('Image'), updateBookImage)
router.route("/UpdateBook/:_id").patch(adminAuthMiddle, updateBook)
router.route("/deleteBook/:_id").delete(adminAuthMiddle, deleteBook)
router.route("/allbookdetails").get(authMiddle, AllBooksDetaile)
router.route("/searchbook").get(authMiddle, searchBook)
router.route("/BorrowBook/:_id").get(authMiddle, borrowBook)
router.route("/BorrowBookDetails").post(authMiddle, borrowBookDetails)
router.route("/ReturnBorrowBook").post(authMiddle, returnborrowBook)
export default router