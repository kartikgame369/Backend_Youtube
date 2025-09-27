import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.COUDINARY_API_KEY,
    api_secret:process.env.COUDINARY_API_SECRET
});

const uploadOnCloudinary= async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        // upload the file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has  been uploaded sucessfull
        console.log("file upload sucessfully",response.url)
        return response

    }catch(error){
        fs.unlinkSync(localFilePath) 
        // remove the local temp saved files 
        return null;
     
    }

}

export {uploadOnCloudinary}




