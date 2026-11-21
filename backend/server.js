const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Error:", err));

// Medicine Schema
const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    dosage: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    period: {
        type: String,
        enum: ["Morning", "Afternoon", "Evening", "Night"],
        required: true
    },
    status: {
        type: String,
        enum: ["Taken", "Pending", "Skipped"],
        default: "Pending"
    }
}, {
    timestamps: true
});

const Medicine = mongoose.model("Medicine", medicineSchema);

// TEST ROUTE
app.get("/", (req, res) => {
    res.send("MediCare Backend is Running!");
});

// GET ALL MEDICINES
app.get("/api/medicines", async (req, res) => {
    try {
        const medicines = await Medicine.find().sort({ time: 1 });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch medicines" });
    }
});

// ADD MEDICINE
app.post("/api/medicines", async (req, res) => {
    try {
        const { name, dosage, time, period } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof dosage !== "string" || !dosage.trim() ||
            typeof time !== "string" ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||
            !["Morning", "Afternoon", "Evening", "Night"].includes(period)
        ) {
            return res.status(400).json({
                message: "Please provide valid medicine details"
            });
        }

        const medicine = new Medicine({
            name: name.trim(),
            dosage: dosage.trim(),
            time,
            period
        });

        await medicine.save();

        res.status(201).json({
            message: "Medicine added successfully",
            medicine
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to add medicine" });
    }
});

// UPDATE MEDICINE STATUS
app.patch("/api/medicines/:id", async (req, res) => {
    try {
        const { status } = req.body;

        if (!["Taken", "Pending", "Skipped"].includes(status)) {
            return res.status(400).json({
                message: "Invalid medicine status"
            });
        }

        const medicine = await Medicine.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        res.json({
            message: "Medicine status updated",
            medicine
        });

    } catch (error) {
        res.status(400).json({
            message: "Invalid medicine ID or request"
        });
    }
});

// DELETE MEDICINE
app.delete("/api/medicines/:id", async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(
            req.params.id
        );

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        res.json({
            message: "Medicine deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            message: "Invalid medicine ID"
        });
    }
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`MediCare server running on port ${PORT}`);
});
