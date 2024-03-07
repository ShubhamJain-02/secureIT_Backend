import mongoose from "mongoose";

const VulSchema=mongoose.Schema({
    risk_scenario:{
        type:String,
        required:true
    },
    threat:{
        type:String,
        required:true
    },
    vul:{
        type:String,
        required:true
    },
    access:{
        type:String,
        required:true
    },
    actor:{
        type:String,
        required:true
    },
    motive:{
        type:String,
        required:true
    },
    impact:{
        type:Number,
        required:true
    },
    likelihood:{
        type:Number,
        required:true
    },
    inh_risk:{
        type:Number,
        required:true
    },
   
});

export const vul=mongoose.model('Vul_SecureITLab',VulSchema);