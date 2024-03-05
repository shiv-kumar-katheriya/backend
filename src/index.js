import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path : "./env"
})


connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("Error occured after DB connected successfully ",error);
        throw error;
    });
    let port = process.env.PORT || 8000
    app.listen(port,()=>{
        console.log(`Server is running at port ${port} `);
    })
})
.catch(err =>{
    console.log("Error Occured While connecting to the database : ",err);
} )

