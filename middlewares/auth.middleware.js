import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken"
import { pool } from "../db/db.config.js";

export const verifyJWT = asyncHandler(async (req,res,next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        return res.status(401).json({
            message : "Token not provided",
        })
    }
    try{
        const decodedToken = jwt.verify(token,process.env.JWT_ACCESS_SECRET)
        const user = await pool.query("SELECT * FROM users WHERE id=?",[decodedToken?.id])

        if(!user){
             return res.status(401).json({
            message : "Invalid Access token",
        })
    }

        if(!user[0][0].is_active){
            return res.status(403).json({
                "message" : "User is setted inactive by admin"
            })
        }
        req.user = { user , role : decodedToken?.role};
        next();
        
    }catch(error){
        return res.status(401).json({
            message : "Invalid Access token",
        })
    }
})
