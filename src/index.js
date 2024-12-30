import dotenv from 'dotenv'
dotenv.config({
    path : './.env'
})

import { app } from './app.js';
import connectDB from './db/connection.db.js';


connectDB().then(()=>{
    app.listen(process.env.PORT || 3000, () =>{
        console.log(`server running at port: ${process.env.PORT}`)
    })
}).catch((e) =>{
    console.log("Mongodb connection failed !! ", e)
});

