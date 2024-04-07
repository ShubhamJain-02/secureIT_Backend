import express from "express";
import multer from 'multer';
import xlsx from 'xlsx';
import { asset } from "../assetModel.js";
import { vul } from "../vulModel.js";


const router=express.Router();
//asset creation
const determineRiskLevel = (value) => {
    if (value >= 1 && value < 6) {
      return 1;
    } else if (value >= 6 && value < 18) {
      return 2;
    } else if (value >= 18 && value <= 27) {
      return 3;
    }
    return 0; 
  };
  router.post("/", async (request, response) => {
    try {
        const scaledValue = request.body.conf * request.body.avail * request.body.avail;
        const riskLevel = determineRiskLevel(scaledValue);
        const storLocFilter = request.body.stor_loc === 'cloud' ? 'Tech' : ['Tech', 'Physical'];

        const allVulnerabilities = await vul.find({ org: { $in: storLocFilter } });
        const mappedVulnerabilities = allVulnerabilities.map(vulnerability => {
          const _id = vulnerability._id;
          return{
            _id,
            org: vulnerability.org,
            control_num: vulnerability.control_num,
            sec_name: vulnerability.sec_name,
            con_type: vulnerability.con_type,
            isp: vulnerability.isp,
            cyb_con: vulnerability.cyb_con,
            op_cab: vulnerability.op_cab,
            sec_dom: vulnerability.sec_dom,
            control: vulnerability.control,
            purpose: vulnerability.purpose,
            mat_level: vulnerability.mat_level,
            mat_ob: vulnerability.mat_ob,
            com: vulnerability.com,
            iso_control: vulnerability.iso_control.map(control => {
              const _id=control._id;
                return{
                  _id,
                  risk_scenario: control.risk_scenario,
                threat: control.threat,
                vul: control.vul,
                access: control.access,
                actor: control.actor,
                motive: control.motive,
                impact: riskLevel,
                likelihood: control.likelihood,
                inh_risk: riskLevel * control.likelihood,
          }}),
        }});

        const newAsset = {
            department: request.body.department,
            info_asset: request.body.info_asset,
            format: request.body.format,
            asset_type: request.body.asset_type,
            desc: request.body.desc,
            stor_loc: request.body.stor_loc,
            conf: request.body.conf,
            integrity: request.body.integrity,
            avail: request.body.avail,
            asset_value: riskLevel,
            classification: request.body.classification,
            asset_with: request.body.asset_with,
            shared_with: request.body.shared_with,
            vulnerabilities: mappedVulnerabilities,
        };

        const create_asset = await asset.create(newAsset);
        return response.status(201).send(create_asset);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

//displaying assets
router.get("/", async (request, response) => {
    try {
        const get_asset = await asset.find({});
        return response.status(201).json({
            count: get_asset.length,
            data: get_asset
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

//displaying one asset
router.get("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const one_asset = await asset.findById(id);
        return response.status(201).json(one_asset);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

//update the asset
router.put("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const result = await asset.findByIdAndUpdate(id, request.body);
        if (!result) {
            return response.status(404).json({ message: "Asset not found" })
        }
        return response.status(200).json({ message: "Asset updated successfully" });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

//delete an asset
router.delete("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const result = await asset.findByIdAndDelete(id, request.body);
        if (!result) {
            return response.status(404).json({ message: "Asset not found" })
        }
        return response.status(200).json({ message: "Asset deleted successfully" });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

//upload assets
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ... existing routes ...

// New route for handling Excel file upload
router.post('/upload', upload.single('file'), async (request, res) => {
  try {
    if (!request.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(request.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    const formData = new FormData();
    //console.log(data);
    const keyMapping = {
        'Department': 'department',
        'Information Asset / Application Name': 'info_asset',
        'Format': 'format',
        'Asset Type': 'asset_type',
        'Description': 'desc',
        'Asset storage location': 'stor_loc',
        'Confidentiallity': 'conf',
        'Integrity': 'integrity',
        'Availability': 'avail',
        'Asset Value': 'asset_value',
        'Classification': 'classification',
        'Access With': 'asset_with',
        'Shared with': 'shared_with',
      };
      const mappedData = data.map(entry => {
        const mappedEntry = {};
        Object.entries(entry).forEach(([oldKey, value]) => {
          const newKey = keyMapping[oldKey] || oldKey;
          mappedEntry[newKey] = value;
        });
        return mappedEntry;
      });
      console.log(mappedData);

    // Process the data and store it in the database
    // Assuming the Excel sheet has the same structure as the asset model
    // You may need to adjust this based on your actual Excel file format

    // const mappedAssets = data.map(item => ({
    //   department: item.Department,
    //   info_asset: item.'Information Asset / Application Name',
    //   format: item.format,
    //   // ... other fields ...
    // }));

   // =IF(AND(assetData.conf * assetData.avail * assetData.avail>=1, assetData.conf * assetData.avail * assetData.avail<=6), "LOW", IF(AND(assetData.conf * assetData.avail * assetData.avail>=7, assetData.conf * assetData.avail * assetData.avail<=18), "MEDIUM", IF(AND(assetData.conf * assetData.avail * assetData.avail>=19, assetData.conf * assetData.avail * assetData.avail<=27), "HIGH")))

        const createdAssets = [];
        for (const assetData of mappedData) {
          console.log("hi");
          const scaledValue = assetData.conf *assetData.avail *assetData.avail;
          const riskLevel = determineRiskLevel(scaledValue);
          const storLocFilter = assetData.stor_loc === 'cloud' ? 'Tech' : ['Tech', 'Physical'];
  
          const allVulnerabilities = await vul.find({ org: { $in: storLocFilter } });
          const mappedVulnerabilities = allVulnerabilities.map(vulnerability => {
            const _id = vulnerability._id;
            return{
              _id,
              org: vulnerability.org,
              control_num: vulnerability.control_num,
              sec_name: vulnerability.sec_name,
              con_type: vulnerability.con_type,
              isp: vulnerability.isp,
              cyb_con: vulnerability.cyb_con,
              op_cab: vulnerability.op_cab,
              sec_dom: vulnerability.sec_dom,
              control: vulnerability.control,
              purpose: vulnerability.purpose,
              mat_level: vulnerability.mat_level,
              mat_ob: vulnerability.mat_ob,
              com: vulnerability.com,
              iso_control: vulnerability.iso_control.map(control => {
                const _id=control._id;
                  return{
                    _id,
                    risk_scenario: control.risk_scenario,
                  threat: control.threat,
                  vul: control.vul,
                  access: control.access,
                  actor: control.actor,
                  motive: control.motive,
                  impact: riskLevel,
                  likelihood: control.likelihood,
                  inh_risk: riskLevel * control.likelihood,
            }}),
          }});
  
          const newAsset = {
            department: assetData.department,
            info_asset: assetData.info_asset,
            format: assetData.format,
            asset_type: assetData.asset_type,
            desc: assetData.desc,
            stor_loc: assetData.stor_loc,
            conf: assetData.conf,
            integrity: assetData.integrity,
            avail: assetData.avail,
            asset_value: riskLevel,
            classification: assetData.classification,
            asset_with: assetData.asset_with,
            shared_with: assetData.shared_with,
            vulnerabilities: mappedVulnerabilities,
          };
  
          const create_asset = await asset.create(newAsset);
          createdAssets.push(create_asset);
          }
          return res.status(201).json(createdAssets);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
});

//edit maturity
router.put("/:assetId/vulnerability/:vulnerabilityId/maturity", async (request, response) => {
  try {
    const { assetId, vulnerabilityId } = request.params;
    const { mat_level } = request.body;

    const assets = await asset.find({}); // Find all assets
    for (const asset_new of assets) {
      const vulnerability = asset_new.vulnerabilities.find(vul => vul._id.toString() === vulnerabilityId);

      if (!vulnerability) {
        continue; 
      }

      // Update the mat_level of the found vulnerability
      vulnerability.mat_level = mat_level;

      // Set the likelihood based on the mat_level
      let likelihood;
      if (mat_level >= 4 && mat_level <= 5) {
        likelihood = 1;
      } else if (mat_level >= 2 && mat_level <= 3) {
        likelihood = 2;
      } else {
        likelihood = 3;
      }

      // Update the likelihood of the vulnerability
      vulnerability.iso_control.forEach(control => {
        control.likelihood = likelihood;
        control.inh_risk = control.impact * likelihood;
      });

      await asset_new.save(); // Save the updated asset
    }

    return response.status(200).json({ message: "Maturity level and likelihood updated successfully for all assets" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});






export default router;