import mongoose from "mongoose";

const AssetSchema=mongoose.Schema({
    department:{
        type:String,
        required:true
    },
    info_asset:{
        type:String,
        required:true
    },
    format:{
        type:String,
        required:true
    },
    asset_type:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    stor_loc:{
        type:String,
        required:true
    },
    conf:{
        type:Number,
        required:true
    },
    integrity:{
        type:Number,
        required:true
    },
    avail:{
        type:Number,
        required:true
    },
    asset_value:{
        type:Number,
        required:true
    },
    classification:{
        type:String,
        required:true
    },
    asset_with:{
        type:String,
        required:true
    },
    shared_with:{
        type:String,
        required:true
    },
    vulnerabilities: [{
        risk_scenario: { type: String, required: true },
        threat: { type: String, required: true },
        vul: { type: String, required: true },
        access: { type: String, required: true },
        actor: { type: String, required: true },
        motive: { type: String, required: true },
        impact: { type: Number, required: true },
        likelihood: { type: Number, required: true },
        inh_risk: { type: Number, required: true },
    }],
});

export const asset=mongoose.model('Assets_SecureITLab',AssetSchema);