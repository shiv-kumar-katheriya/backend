import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import { jwt } from "jsonwebtoken";

const userSchema = new Schema({
        userName : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        fullname : {
            type : String,
            required : true,
            lowercase : true,
            index : true
        },
        avatar : {
            type : String, // we are using cloudanary url
            required : true,
        },
        coverImage  : {
            type : String // here also we are using cloudnary url
        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password : {
            type : String,
            required : [true, "Password is required field"]
        },
        refreshToken : {
            type : String
        }

    },
    {
        timestamps : true
    }
);

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password =  await bcrypt.hash(this.password,10);
        next();
    }
    else {
        return next();
    }
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this.id,
            email : this.email,
            username : this.username,
            fullname : this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this.id,
            email : this.email,
            username : this.username,
            fullname : this.fullname,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User",userSchema);

export {User};