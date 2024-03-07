import express from "express";
import { vul } from "../vulModel.js";
const router2=express.Router();
//vul creation
router2.post("/", async (request, response) => {
    try {
        const newVul = {
            risk_scenario: request.body.risk_scenario,
            threat: request.body.threat,
            vul: request.body.vul,
            access: request.body.access,
            actor: request.body.actor,
            motive: request.body.motive,
            impact: request.body.impact,
            likelihood: request.body.likelihood,
            inh_risk: request.body.inh_risk,
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

export default router2;