import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended : true,limit : "16kb"}))
app.use(express.static("public"))

app.use(
    cors({
        origin : process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
        credentials : true,
        methods : ["GET","POST","PUT","PATCH",
            "DELETE", "OPTIONS"],
    
        allowedHeaders : ["Content-Type","Authorization"]
    })
)


app.use(cookieParser());

import authRouter from "./routes/auth.routes.js"

app.use("/auth",authRouter)

export default app
