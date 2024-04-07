import mongoose from "mongoose";

const VulSchema = mongoose.Schema({
    org: {
        type: String,
        required: true,
    },
    control_num: {
        type: Number,
        required: true
    },
    sec_name: {
        type: String,
        required: true
    },
    con_type: {
        type: String,
        required: true
    },
    isp: {
        type: String,
        required: true
    },
    cyb_con: {
        type: String,
        required: true
    },
    op_cab: {
        type: String,
        required: true
    },
    sec_dom: {
        type: String,
        required: true
    },
    control: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    mat_level: {
        type: String,
        required: true
    },
    mat_ob: {
        type: String,
        required: true
    },
    com:{
        type:String,
        required:true
    },
    iso_control: [
        {
            risk_scenario: {
                type: String,
                required: true
            },
            threat: {
                type: String,
                required: true
            },
            vul: {
                type: String,
                required: true
            },
            access: {
                type: String,
                required: true
            },
            actor: {
                type: String,
                required: true
            },
            motive: {
                type: String,
                required: true
            },
            impact: {
                type: Number,
                required: true
            },
            likelihood: {
                type: Number,
                required: true
            },
            inh_risk: {
                type: Number,
                required: true
            },
        
        }
    ],
   
});

export const vul = mongoose.model('Vul_SecureITLab', VulSchema);