import express from "express";
import { vul } from "../vulModel.js";
const router2=express.Router();
//vul creation
router2.post("/", async (request, response) => {
    try {
        const newVul = {
            iso_control: request.body.iso_control.map(item => ({
                risk_scenario: item.risk_scenario,
                threat: item.threat,
                vul: item.vul,
                access: item.access,
                actor: item.actor,
                motive: item.motive,
                impact: item.impact,
                likelihood: item.likelihood,
                inh_risk: item.inh_risk
            })),
            org: request.body.org,
            control_num: request.body.control_num,
            sec_name: request.body.sec_name,
            con_type: request.body.con_type,
            isp: request.body.isp,
            cyb_con: request.body.cyb_con,
            op_cab: request.body.op_cab,
            sec_dom: request.body.sec_dom,
            control: request.body.control,
            purpose: request.body.purpose,
            mat_level: request.body.mat_level,
            mat_ob: request.body.mat_ob,
            com:request.body.com,
        };
        const create_vul = await vul.create(newVul);
        return response.status(201).send(create_vul);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

//All the vuls
router2.get("/", async (request, response) => {
    try {
        const get_vul = await vul.find({});
        return response.status(201).json({
            count: get_vul.length,
            data: get_vul
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

//displaying one vul
router2.get("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const one_vul = await vul.findById(id);
        return response.status(201).json(one_vul);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

//update the vul
router2.put("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const result = await vul.findByIdAndUpdate(id, request.body);
        if (!result) {
            return response.status(404).json({ message: "Vulnerability not found" })
        }
        return response.status(200).json({ message: "Vulnerability updated successfully" });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

//delete a vul
router2.delete("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const result = await vul.findByIdAndDelete(id, request.body);
        if (!result) {
            return response.status(404).json({ message: "Vulnerability not found" })
        }
        return response.status(200).json({ message: "Vulnerability deleted successfully" });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
})

router2.delete("/", async (request, response) => {
    try {
        const result = await vul.deleteMany({});
        return response.status(200).json({ message: "All vulnerabilities deleted successfully", deletedCount: result.deletedCount });
    } catch (error) {
        console.error(error.message);
        response.status(500).json({ message: error.message });
    }
});


//update the maturity
// router2.put("/:id/maturity", async (request, response) => {
//     try {
//         const { id } = request.params;
//         const { mat_level } = request.body;
        
//         const updatedVul = await vul.findByIdAndUpdate(id, { mat_level }, { new: true });

//         if (!updatedVul) {
//             return response.status(404).json({ message: "Vulnerability not found" });
//         }

//         return response.status(200).json({ message: "Maturity level updated successfully", updatedVul });
//     } catch (error) {
//         console.error(error.message);
//         response.status(500).json({ message: error.message });
//     }
// });

export default router2;