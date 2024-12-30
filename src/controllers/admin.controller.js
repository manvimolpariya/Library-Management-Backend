import { Admin } from "../models/admin.models.js";
import Joi from "joi";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const AdminLogIn = async(req, res, next) =>{
     const AdminSchema = Joi.object({
        Email : Joi.string().required(),
        Password : Joi.string().required()
     })
     try {
        const {error} = AdminSchema.validate(req.body);
        if(error){
            return next(error);
        }

        const { Email, Password } = req.body;
          const findAdmin = await Admin.findOne({Email});
          if(!findAdmin) {
            let error = {
                status : 404,
                message : " can't find"
            }
            return next(error);
          }

       let  comparePassword = await bcrypt.compare(Password, findAdmin.Password)
       if(!comparePassword) {
        let error = {
            status : 404,
            message : " can't find"
        }
        return next(error);
      }
   //   console.log(findAdmin._id )
       
      const AccessToken = jwt.sign({ _id: findAdmin._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); 
      return  res.status(200).cookie('AccessToken', AccessToken, {
        httpOnly: true, // Secure, inaccessible to client-side JS
        secure: true, // Send cookie only over HTTPS in production 
      }).json({Admin : "LogIn", auth : true});

     } catch (error) {
       return next(error) 
     }
   
}

const AdminRegister = async (req, res, next) => {

    try {
    // Define the validation schema
    const AdminSchema = Joi.object({
      Email: Joi.string().email().required(),
      Password: Joi.string().min(6).required(), // Added min length for better security
    });

    // Validate the request body
    const { error } = AdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Destructure validated values
    const { Email, Password } = req.body;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    // Create the admin record
    const adminRegister = await Admin.create({
      Email,
      Password: hashedPassword,
    });

    if (!adminRegister) {
      return res.status(500).json({ message: "Admin registration issue!!" });
    }

    // Fetch admin without the password field
    const findAdmin = await Admin.findById(adminRegister._id).select('-Password');

    // Respond with the newly created admin details
    return res.status(200).json({ admin: findAdmin, auth: true });
  } 
  catch (error) {
    console.error("Error in AdminRegister:", error);
    return next(error);
  }
}
const AdminLogOut = async (req, res, next) => {
 try {
         Admin.findById(req.user._id)
         const options ={
            httpOnly : true,
            secure : true
         }
         return res.status(200).clearCookie("AccessToken",options).json({message : "user Logout", auth : false})
    } catch (error) {
        return next(error)
    }
}



export { AdminLogIn, AdminRegister, AdminLogOut }
