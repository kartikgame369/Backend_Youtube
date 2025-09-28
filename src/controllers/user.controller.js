import express from 'express'
import {asynHandler} from "../utils/asyncHandeler.js";
import {apiError} from "../utils/apiError.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asynHandler(async(req,res)=>{
   // get user details from frontend
   // taking data from postman 
   // validations [ email correct or not [not empty]]
   // check if user alredy exsist 
   // check from both username email 
   // check for images , check for avatar
   // if availabe upload then on cloudinary , check avatar 
   // create user object for mongo db  create enty in db 
   // remove password and refresh token field from response
   // check for user creation 
   // return response 
   const {fullName,email,username,password}=req.body
   console.log("email:",email);
   
   if(
    [fullName,email,username,password].some((field)=>{
        field?.trim()==""
})
   ){
          throw new apiError(400,"all fields are required")
   }
   const existedUser=User.findOne({
    $or: [{username},{email}]
   })
   if(existedUser){
    throw new apiError(409,"user with email or username exsist")
   }

  const avatarLocalPath= req.files?.avatar[0]?.path;
  const coverImageLocalPath= req.files?.coverImage[0]?.path;
  path;
  if(!avatarLocalPath){
    throw new apiError(400,"avatar file is required ")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if(!avatar){
    throw new apiError(400,"avatar is required")
  }
 const user = await  User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage.url || "",
    email,
    password,
    username:username.toLowerCase()
  })
  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  ) 
  if(!createdUser){
    throw new apiError(500,"something went wrong while regeistring the user")
  }
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User register successfulley")
  )
});

export {
    registerUser,
}