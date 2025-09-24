import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({limit:"20kb"}))
//  json files comming at perticular limit
app.use(express.urlencoded({extended:true,limit:"20kb"}))
//  allowing the urls for the data
app.use(express.static("public"))
//  static for my public folder files 

app.use(cookieparser())

export {app};

