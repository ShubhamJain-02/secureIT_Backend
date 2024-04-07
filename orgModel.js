import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
    department: {
      type: String,
      
    },
    info_asset: {
      type: String,
      
    },
    format: {
      type: String,
      
    },
    asset_type: {
      type: String,
      
    },
    desc: {
      type: String,
      
    },
    stor_loc: {
      type: String,
      
    },
    conf: {
      type: Number,
      
    },
    integrity: {
      type: Number,
      
    },
    avail: {
      type: Number,
      
    },
    asset_value: {
      type: Number,
      
    },
    classification: {
      type: String,
      
    },
    asset_with: {
      type: String,
      
    },
    shared_with: {
      type: String,
      
    },
    vulnerabilities: [{
      org: { type: String,  },
      control_num: { type: Number,  },
      sec_name: { type: String,  },
      con_type: { type: String,  },
      isp: { type: String,  },
      cyb_con: { type: String,  },
      op_cab: { type: String,  },
      sec_dom: { type: String,  },
      control: { type: String,  },
      purpose: { type: String,  },
      mat_level: { type: String,  },
      mat_ob: { type: String,  },
      com: { type: String,  },
      iso_control: [{
        risk_scenario: { type: String,  },
        threat: { type: String,  },
        vul: { type: String,  },
        access: { type: String,  },
        actor: { type: String,  },
        motive: { type: String,  },
        impact: { type: Number,  },
        likelihood: { type: Number,  },
        inh_risk: { type: Number,  },
      }]
    }]
  });
  

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  assets: [AssetSchema]
});

const Organization = mongoose.model('Organization', OrganizationSchema);

export default Organization;
