
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/taskmanager")
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(5000, () => {
            console.log("Server running at http://localhost:5000");
        });
    })
    .catch(err => {
        console.log("MongoDB connection error:", err.message);
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

// GET - Fetch Tasks
app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });

        console.log(`[GET] Fetched ${tasks.length} tasks`);

        res.json(tasks);
    } catch (error) {
        console.log("[ERROR] Fetching tasks:", error.message);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// POST - Create Task
app.post("/tasks", async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const task = await Task.create({ title: title.trim() });

        console.log(`[POST] Task Created: ${task.title}`);

        res.status(201).json(task);
    } catch (error) {
        console.log("[ERROR] Creating task:", error.message);
        res.status(500).json({ message: "Error creating task" });
    }
});

// PATCH - Update Task Status
app.patch("/tasks/:id", async (req, res) => {
    try {
        const { status } = req.body;

        if (!["Pending", "Ongoing", "Completed"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        console.log(`[PATCH] Task Updated: ${task.title} -> ${task.status}`);

        res.json(task);
    } catch (error) {
        console.log("[ERROR] Updating task:", error.message);
        res.status(400).json({ message: "Error updating task" });
    }
});

// DELETE - Delete Task
app.delete("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        console.log(`[DELETE] Task Deleted: ${task.title}`);

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.log("[ERROR] Deleting task:", error.message);
        res.status(400).json({ message: "Error deleting task" });
    }
});