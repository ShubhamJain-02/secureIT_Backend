import express, { request, response } from "express"; 
import {PORT,mongoDBURL} from "./config.js";
import mongoose from "mongoose";
import router from "./routes/AssetRoutes.js";
import router2 from "./routes/VulRoutes.js";
import router3 from "./routes/OrgRoutes.js";
import { asset } from "./assetModel.js";
import cors from 'cors';
const app=express();
//handle the cors policy
app.use(cors());
app.use(express.json());
app.get('/',(request,response)=>{
    console.log(request);
    return response.status(234).send("Hi erger");
});
app.use('/asset',router);
app.use('/vul',router2);
app.use('/org',router3);

// app.use(cors({
//     origin:'http://localhost:3000',
//     methods:['GET','POST','PUT','DELETE'],
//     allowedHeaders:['Content-Type']
// }));
mongoose.connect(mongoDBURL).then(()=>{
    console.log("App connected to database");
    app.listen(PORT,()=>{
        console.log(`App listening to port: ${PORT}`);
    });
    
}).catch((error)=>{
    console.log(error)
});