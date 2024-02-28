import mongoose from "mongoose";
import { dbName } from "../constants.js";


const connectDB = async ()=>{
    try {
        const databaseConnectionHostName = await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`);
        console.log(" :: DataBase Connection Successfull Host Name  :: ",databaseConnectionHostName.connection.host);
    } catch (error) {
        console.log("DataBase Connection Failed  : ",error);
        process.exit(1);
    }
    
}

export default connectDB;