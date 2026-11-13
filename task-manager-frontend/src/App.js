
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API = "http://localhost:5000/tasks";

function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeView, setActiveView] = useState("Dashboard");

    const statuses = ["Pending", "Ongoing", "Completed"];

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            const response = await axios.get(API);
            setTasks(response.data);
            setError("");
        } catch (err) {
            setError("Could not fetch tasks. Check backend server.");
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Add task
    const createTask = async () => {
        if (!title.trim()) {
            setError("Task title cannot be empty");
            setSuccess("");
            return;
        }

        try {
            await axios.post(API, { title: title.trim() });
            setTitle("");
            setSuccess("Task added successfully!");
            setError("");
            fetchTasks();
        } catch (err) {
            setError("Could not create task");
            setSuccess("");
        }
    };

    // Update task status
    const updateTaskStatus = async (id, status) => {
        try {
            await axios.patch(`${API}/${id}`, { status });
            setSuccess("Task status updated!");
            setError("");
            fetchTasks();
        } catch (err) {
            setError("Could not update task");
            setSuccess("");
        }
    };

    // Delete task
    const deleteTask = async (id) => {
        try {
            await axios.delete(`${API}/${id}`);
            setSuccess("Task deleted successfully!");
            setError("");
            fetchTasks();
        } catch (err) {
            setError("Could not delete task");
            setSuccess("");
        }
    };

    const totalTasks = tasks.length;
    const pendingCount = tasks.filter(task => task.status === "Pending").length;
    const ongoingCount = tasks.filter(task => task.status === "Ongoing").length;
    const completedCount = tasks.filter(task => task.status === "Completed").length;

    const visibleStatuses =
        activeView === "Completed" ? ["Completed"] : statuses;

    return (
        <div className="app-layout">

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">✓</div>
                    <h4>Task Manager</h4>
                    <p>Plan · Track · Achieve</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-link ${activeView === "Dashboard" ? "active" : ""}`}
                        onClick={() => setActiveView("Dashboard")}
                    >
                        <span>▦</span> Dashboard
                    </button>

                    <button
                        className={`nav-link ${activeView === "All Tasks" ? "active" : ""}`}
                        onClick={() => setActiveView("All Tasks")}
                    >
                        <span>☷</span> All Tasks
                    </button>

                    <button
                        className={`nav-link ${activeView === "Completed" ? "active" : ""}`}
                        onClick={() => setActiveView("Completed")}
                    >
                        <span>✓</span> Completed
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <span>Task Manager</span>
                    <small>Stay organized and productive.</small>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">

                {/* Header */}
                <header className="dashboard-header">
                    <div>
                        <h1>
                            {activeView === "Dashboard"
                                ? "Welcome to Task Manager"
                                : activeView}
                        </h1>
                        <p>Organize your work. Stay productive.</p>
                    </div>

                    <button
                        className="refresh-btn"
                        onClick={fetchTasks}
                    >
                        ↻ Refresh
                    </button>
                </header>

                {/* Alerts */}
                {error && (
                    <div className="alert alert-danger">
                        {error}
                        <button
                            className="btn-close float-end"
                            onClick={() => setError("")}
                        />
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                        <button
                            className="btn-close float-end"
                            onClick={() => setSuccess("")}
                        />
                    </div>
                )}

                {/* Statistics */}
                <section className="stats-grid">
                    <div className="stat-card total-card">
                        <div>
                            <p>Total Tasks</p>
                            <h2>{totalTasks}</h2>
                        </div>
                        <div className="stat-icon">▤</div>
                    </div>

                    <div className="stat-card pending-card">
                        <div>
                            <p>Pending</p>
                            <h2>{pendingCount}</h2>
                        </div>
                        <div className="stat-icon">◷</div>
                    </div>

                    <div className="stat-card ongoing-card">
                        <div>
                            <p>Ongoing</p>
                            <h2>{ongoingCount}</h2>
                        </div>
                        <div className="stat-icon">▶</div>
                    </div>

                    <div className="stat-card completed-card">
                        <div>
                            <p>Completed</p>
                            <h2>{completedCount}</h2>
                        </div>
                        <div className="stat-icon">✓</div>
                    </div>
                </section>

                {/* Add Task */}
                <section className="add-task-section">
                    <h3>＋ Add New Task</h3>

                    <div className="add-task-form">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter task name..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") createTask();
                            }}
                        />

                        <button
                            className="add-task-btn"
                            onClick={createTask}
                        >
                            + Add Task
                        </button>
                    </div>
                </section>

                {/* Task Columns */}
                <section className={`task-board ${visibleStatuses.length === 1 ? "single-column" : ""}`}>
                    {visibleStatuses.map(status => {
                        const filteredTasks = tasks.filter(
                            task => task.status === status
                        );

                        return (
                            <div className={`task-column ${status.toLowerCase()}-column`} key={status}>

                                <div className="column-header">
                                    <h3>
                                        <span className={`status-dot ${status.toLowerCase()}-dot`}></span>
                                        {status}
                                        <span className="task-count">
                                            {filteredTasks.length}
                                        </span>
                                    </h3>
                                </div>

                                <div className="column-body">
                                    {filteredTasks.map(task => (
                                        <div className="task-card" key={task._id}>
                                            <div className="task-card-top">
                                                <h5>{task.title}</h5>
                                                <span className={`status-badge ${status.toLowerCase()}-badge`}>
                                                    {task.status}
                                                </span>
                                            </div>

                                            <div className="task-actions">
                                                {task.status === "Pending" && (
                                                    <button
                                                        className="action-btn start-btn"
                                                        onClick={() =>
                                                            updateTaskStatus(task._id, "Ongoing")
                                                        }
                                                    >
                                                        Start
                                                    </button>
                                                )}

                                                {task.status !== "Completed" && (
                                                    <button
                                                        className="action-btn complete-btn"
                                                        onClick={() =>
                                                            updateTaskStatus(task._id, "Completed")
                                                        }
                                                    >
                                                        Complete
                                                    </button>
                                                )}

                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => deleteTask(task._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredTasks.length === 0 && (
                                        <p className="empty-message">
                                            No tasks available
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </section>

                <footer className="dashboard-footer">
                    Task Manager · Stay organized and achieve your goals.
                </footer>

            </main>
        </div>
    );
}

export default App;
