import mongoose from "mongoose";

const connectDB = async () =>{
    try {
      const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
      console.log(`\n mongoodb connected !! host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGOODB CONNECTION ERROR", error);
        process.exit(1)
    }
}
export default connectDB ;