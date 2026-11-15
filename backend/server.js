
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskmanager";

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log("MongoDB connection error:", err.message);
    });

// Home Route
app.get("/", (req, res) => {
    res.send("Task Manager Backend is Running!");
});

// Task Schema
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["Pending", "Ongoing", "Completed"],
        default: "Pending"
    }
}, { timestamps: true });

const Task = mongoose.model("Task", TaskSchema);

// GET Tasks
app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// POST Task
app.post("/tasks", async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const task = await Task.create({ title: title.trim() });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: "Error creating task" });
    }
});

// PATCH Task Status
app.patch("/tasks/:id", async (req, res) => {
    try {
        const { status } = req.body;

        if (!["Pending", "Ongoing", "Completed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ message: "Error updating task" });
    }
});

// DELETE Task
app.delete("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error deleting task" });
    }
});
