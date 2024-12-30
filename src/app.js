import express from 'express'

import cors from 'cors'
import cookieParser from 'cookie-parser'
import errorHandler from './middlewares/ErrorApi.js'
const app = express()
app.use(cors({
origin : process.env.CROS_ORIGIN,
credentials : true
}))
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true, limit : '16kb'}))
app.use(express.static("public"))
app.use(cookieParser())


import  userRouter from './routes/user.routes.js'
app.use('/users', userRouter)
app.use(errorHandler);
export {app}