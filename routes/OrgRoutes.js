import express from "express";
import Organization from "../orgModel.js";
import { vul } from "../vulModel.js";
import multer from 'multer';
import xlsx from 'xlsx';

const router3 = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
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
// Create a new organization
router3.post("/", async (request, response) => {
  try {
    const { name, assets } = request.body;
    const organization = new Organization({
      name,
      assets
    });
    const newOrganization = await organization.save();
    return response.status(201).json(newOrganization);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Get all organizations
router3.get("/", async (request, response) => {
  try {
    const organizations = await Organization.find({});
    return response.status(200).json(organizations);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Get organization by ID
router3.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const organization = await Organization.findById(id);
    if (!organization) {
      return response.status(404).json({ message: "Organization not found" });
    }
    return response.status(200).json(organization);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Update organization by ID
router3.put("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const newData = request.body;
    const updatedOrganization = await Organization.findByIdAndUpdate(id, newData, { new: true });
    if (!updatedOrganization) {
      return response.status(404).json({ message: "Organization not found" });
    }
    return response.status(200).json(updatedOrganization);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Delete organization by ID
router3.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const deletedOrganization = await Organization.findByIdAndDelete(id);
    if (!deletedOrganization) {
      return response.status(404).json({ message: "Organization not found" });
    }
    return response.status(200).json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router3.post('/upload/:orgId', upload.single('file'), async (req, res) => {
  try {
    const orgId = req.params.orgId;
    
    // Check if the organization exists
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Map Excel columns to asset schema fields
    const keyMapping = {
      'Department': 'department',
      'Information Asset / Application Name': 'info_asset',
      'Format': 'format',
      'Asset Type': 'asset_type',
      'Description': 'desc',
      'Asset storage location': 'stor_loc',
      'Confidentiality': 'conf',
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

    // Process the uploaded assets
    const createdAssets = [];
    for (const assetData of mappedData) {
      // Determine risk level and other processing here
      const scaledValue = assetData.conf * assetData.avail * assetData.avail;
      const riskLevel = determineRiskLevel(scaledValue);

      // Fetch vulnerabilities based on storage location filter
      const storLocFilter = assetData.stor_loc === 'cloud' ? 'Tech' : ['Tech', 'Physical'];
      const allVulnerabilities = await vul.find({ org: { $in: storLocFilter } });

      // Map vulnerabilities to asset's vulnerabilities field
      const mappedVulnerabilities = allVulnerabilities.map(vulnerability => ({
        _id: vulnerability._id,
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
        iso_control: vulnerability.iso_control.map(control => ({
          _id: control._id,
          risk_scenario: control.risk_scenario,
          threat: control.threat,
          vul: control.vul,
          access: control.access,
          actor: control.actor,
          motive: control.motive,
          impact: riskLevel,
          likelihood: control.likelihood,
          inh_risk: riskLevel * control.likelihood,
        })),
      }));

      // Create the asset object
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

      // Add the new asset to the organization's asset array
      organization.assets.push(newAsset);
    }

    // Save the updated organization with new assets
    await organization.save();

    return res.status(201).json({ message: 'Assets uploaded successfully' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
});

router3.put("/:orgId/:assetId/vulnerability/:vulnerabilityId/maturity", async (request, response) => {
  try {
    const { orgId, assetId, vulnerabilityId } = request.params;
    const { mat_level } = request.body;

    const organization = await Organization.findById(orgId); // Find organization by ID

    if (!organization) {
      return response.status(404).json({ message: "Organization not found" });
    }

    // Find the asset within the organization
    const asset = organization.assets.find(asset => asset._id.toString() === assetId);

    if (!asset) {
      return response.status(404).json({ message: "Asset not found" });
    }

    for (const asset of organization.assets) {
    const vulnerability = asset.vulnerabilities.find(vul => vul._id.toString() === vulnerabilityId);

    if (!vulnerability) {
      return response.status(404).json({ message: "Vulnerability not found" });
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
  }
    await organization.save(); // Save the updated organization

    return response.status(200).json({ message: "Maturity level and likelihood updated successfully for the vulnerability" });
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: "Internal server error" });
  }
});

export default router3;
