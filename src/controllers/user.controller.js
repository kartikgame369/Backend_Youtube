import express from 'express'
import {asynHandler} from "../utils/asyncHandeler.js";
import {ApiError, apiError} from "../utils/apiError.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {jwt} from "jsonwebtoken"
 
const generateAccessAndRefereshToken = async (userId) => {
  try {
    await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refereshToken = user.generateRefreshToken()

    user.refereshToken = refereshToken
    user.save({ validateBeforeSave: false })

    return {accessToken,refereshToken}

  } catch (error) {
    throw new apiError(500, "something went wrong during genarating access and referesh token")
  }
}

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
   const existedUser= await User.findOne({
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

const loginUser = asynHandler(async(req,res)=>{
  // req body data 
  // user name or email validation
  // find the user  
  //  password validation 
  // access and refresh token
  // send cookies 
  const {username,email,password}=req.body
  if(!username && !email){
    throw new apiError(400,"username or password is required")

  }
  const user = await user.findOne({
    $or:[{username},{email}]
  })
  if(!user){
    throw new apiError(404,"user not found")
  }
  const isCorrect = await user.ispasswordCorrect(password)
  if(!isCorrect){
    throw new apiError(404,"invalid user credential")
  }
 const {accessToken,refereshToken}= await generateAccessAndRefereshToken(user._id)
 const loggedInUser = await User.findById(user._id).select("-password -refereshToen")
 const options={
  httpOnly:true,
  secure:true
 }

 return res.status(200).cookie("accessToken",accessToken,options)
.cookie("refreshToekn",refereshToken,options)
.json(
  new ApiResponse(
    200,
    {
      user: loggedInUser,accessToken,
      refereshToken
    },
    "user login successfully"
  )
)

})

const logoutUser = asynHandler(async(req,res)=>{
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refereshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const options={
  httpOnly:true,
  secure:true
 }
 return res
 .status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refereshToken",options)
 .json(new ApiResponse(200,{},"user logout successfully"))
  
})

const refreshAccessToken = asynHandler(async(req,res)=>{
const incomingRefreshToken = req.cookies.refereshToken || req.body.refereshToken
if(!incomingRefreshToken){
  throw new ApiError(401,"unauthorized request")
}
try {
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  
  )
   const user= await User.findById(decodedToken?._id)
   if(!user){
    throw new ApiError(401,"Invalid refersh token")
   }
   if(incomingRefreshToken !== user?.refereshToken){
    throw new apiError(401,"Refresh token is used and expired, login again")
   }
  
   const options={
    httpOnly:true,
    secure:true 
   }
  const {accessToken,newrefereshToken} = await generateAccessAndRefereshToken(user._id)
  
   return res
   .status(200)
   .cookie("accessToken",accessToken,options) 
   .cookie("refereshToken",newrefereshToken,options)
   .json(
    new ApiResponse(200,{accessToken,refereshToken: newrefereshToken},"Access token refreshed")
   )
} catch (error) {
  throw new ApiError(401,"Invalid refersh token ")
}

});

const changeCurrentpassword = asynHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body
  const user = await User.findById(req.user._id)
  const ispasswordCorrect = await user.ispasswordCorrect(oldPassword)
  if(!ispasswordCorrect){
    throw new apiError(400,"old password is incorrect")
  }
  user.password = newPassword
  await user.save({validateBeforeSave:false})
  return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed successfully"))
})
const getCurrentUser = asynHandler(async(res,req)=>{
  return res
  .status(200)
  .json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

const updateAccountDetails = asynHandler(async(req,res)=>{
  const {fullName,email}=req.body
  if(!fullName || !email){
    throw new ApiError(400,"All fields are required")
  }

  User.findByIdAndUpdate(req.user?.id,
    {
      $set:{fullName,email}
    },
    {new:true}
  ).select("-password ")

  return res
  .status(200)
  .json(new ApiResponse(200,{},"user details updated successfully"))  
})
const updateUserAvatar = asynHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new apiError(400,"avatar file is missing")

  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if(!avatar){
    throw new apiError(400,"something went wrong while uploading avatar")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{avatar:avatar.url}
    },
    {new:true}
  ).select("-password ")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"user avatar updated successfully"))  


})
const updateUserCoverImqage = asynHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new apiError(400,"cover image is  file is missing")

  }

  const coverImage = await uploadOnCloudinary(avatarLocalPath)
  if(!avatar){
    throw new apiError(400,"something went wrong while uploading Cover Image")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{coverImage:coverImage.url}
    },
    {new:true}
  ).select("-password ")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"user cover image updated successfully"))  

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentpassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImqage
    
}