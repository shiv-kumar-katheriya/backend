import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js"
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req,res,next)=>{
    try {
        
        const token = req.cookies?.accessToken ||  req.headers['authorization']?.replace("Bearer ","")

        if(!token){
            throw new ApiError(401,"Unauthriozed User");    
        }
        
        const decodedUserDetails = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decodedUserDetails?._id).select("-password -refreshToken");
        
        if(!user){
            throw new ApiError(401,"Invalid Access token");
        }
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401,"Unauthriozed User",error);
    }
})






