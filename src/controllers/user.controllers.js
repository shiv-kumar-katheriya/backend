import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudianaryFileUpload.js";
import ApiResponse from "../utils/apiResponse.js";

const registerUser  = asyncHandler( async(req,res)=>{

    const {userName,email,password,fullName} =  req.body;
    
    if([userName,email,password,fullName].some(elm=>{
        if(elm?.trim() == "" || elm == undefined ) return true
    })) {
        throw new ApiError('400', "All the field are Required");
    }

    const userExist = await User.findOne({
        $or : [{userName},{email}]
    })

    if(userExist){
        throw new ApiError('409', "User with this user namr or email already exist");
    }

    let localPathForAvatar = "";
    if(req?.files && req?.files?.avatar && Array.isArray(req?.files?.avatar) 
        && req?.files?.avatar.length > 0 && req?.files?.avatar[0].path){
            localPathForAvatar = req?.files?.avatar[0].path;
    }
    let localPathForCoverImage = "";
    if(req?.files && req?.files?.coverImage && Array.isArray(req?.files?.coverImage) 
        && req?.files?.coverImage.length > 0 && req?.files?.coverImage[0].path){
            localPathForCoverImage = req?.files?.coverImage[0].path;
    }
    if(!localPathForAvatar){
        throw new ApiError('409', "Avatar is required field");
    }

    const avatar = await uploadOnCloudinary(localPathForAvatar);
    let coverImage = await uploadOnCloudinary(localPathForCoverImage);

    if(!coverImage){
        coverImage = ""
    }

    if(!avatar){
        throw new ApiError('409', "Avatar is required field");
    }

    const user =await User.create({
        userName,
        password,
        fullName,
        avatar : avatar.url,
        coverImage : coverImage ? coverImage.url : "",
        email
    })

    const checkUser = await User.findById(user._id).select("-password -refreshToken");

    if(!checkUser){
        throw new ApiError(500,"some thing went wrong while registering the user" );;
    }
    res.status(201).json(new ApiResponse(200,user,"user registered successfully"));

} )


export {registerUser};