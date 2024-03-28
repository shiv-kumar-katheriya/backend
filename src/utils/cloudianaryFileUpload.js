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
        fs.unlinkSync(localFilePath);
        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const deleteOnCloudinary = async (publicId)=>{{
    try {
        // const result = await cloudinary.uploader.destroy(publicId,
        //     {
        //         resource_type : "image"
        //     })
        const result = await cloudinary.api.delete_resources(publicId,
            {
                resource_type : "image"
            })
            console.log("result s :: ",result);
    } catch (error) {
        console.log("error is :: ",error);
        throw error;
    }
}}


export {uploadOnCloudinary,
    deleteOnCloudinary}