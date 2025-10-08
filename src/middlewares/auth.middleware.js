import { ApiError } from "../utils/apiError"
import { asyncHandler } from "../utils/asyncHandeler"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model"

export const verifyJWT = asyncHandler(async(req, _ ,next)=>{
   try {
      const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer"," ")
   
      if(!token){
       throw new ApiError(401,"Unauthorized request ")
      }
   //    all information taking from user model
       const decodedToken = jwt.verify(token,process.env.
         ACCESS_TOKEN_SECRET) 
   
         const user = await User.findById(decodedToken._id).select("-password -refereshToken")
         if(!user){
            throw new ApiError(401,"Unauthorized request , user not found")   
         }
      req.user = user;
      next
       
   } catch (error) {
      throw new ApiError(401,"Unauthorized request , invalid token") 
      
   }
})