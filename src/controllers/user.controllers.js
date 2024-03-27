import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudianaryFileUpload.js";
import ApiResponse from "../utils/apiResponse.js";

import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user =await User.findOne(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});

        return {refreshToken,accessToken};


    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh token");
    }

}

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


const loginUser = asyncHandler( async(req,res)=>{
    const {userName ,email , password} = req.body;
    if(!userName && !email){
        throw new ApiError(401,"user name or email is required field");
    }

    const user =await User.findOne({
        $or : [{userName},{email}]
    })
    
    if(!user){
        throw new ApiError(401,"User not Exist");
    }

    const passwordCorrect  = await user.isPasswordCorrect(password);
    
    if(!passwordCorrect){
        throw new ApiError(401,"*** Please Provide Valid Credential ***");
    }

    const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken")
    
    const options = {
        httpOnly : true,
        secure: true        
    }

    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        200,
        {
            accessToken,
            refreshToken, 
            user : loggedInUser 
        },
        "User Logged In successfully"
    ))
})


const logoutUser = asyncHandler(async(req,res)=>{
    console.log("***********  Inside Logout User   ************");
    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
         $set : {
            refreshToken : undefined
         }   
        },
        {
            new : true
        })

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "user logged out!"));
    
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"refresh Token doesn't exist");
    }

    const decodeInformation = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);


    if(!decodeInformation){
        throw new ApiError(401,"Invalid refresh Token");
    }

    const userInfo =await User.findById(decodeInformation._id)
    if(!userInfo){
        throw new ApiError(401,"Invalid refresh Token");
    }
    
    if(incomingRefreshToken !== userInfo.refreshToken){
        throw new ApiError(401,"Invalid refresh Token");
    }

    const {refreshToken,accessToken} =await generateAccessAndRefreshToken(userInfo._id);

    let options = {
        httpOnly : true,
        secure : true
    }

    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        200,
        {
            accessToken,
            refreshToken, 
        },
        "Access Token Is refreshed"
    ))





})



export {registerUser,loginUser, logoutUser, refreshAccessToken };