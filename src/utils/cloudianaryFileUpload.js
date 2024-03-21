import fs from "fs";
import {v2 as cloudinary} from 'cloudinary';
          

cloudinary.config({ 
  cloud_name: process.env.CLOUDIANRY_CLOUD_NAME, 
  api_key: process.env.CLOUDIANRY_API_KEY, 
  api_secret: process.env.CLOUDIANRY_API_SECRET 
});

const uploadOnCloudinary =  async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        const result = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type : "auto"
            }
        )
        console.log("result after file upload is :: ",result);
        return result;
    } catch (error) {
        console.log("error is ::: ",error);
        fs.unlinkSync(localFilePath)
        return null;
    }
}


export {uploadOnCloudinary}