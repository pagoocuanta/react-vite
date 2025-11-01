import dotenv from "dotenv";
dotenv.config(); // ✅ this actually loads the .env file

import express from "express";
import path from "path";
import serverless from "serverless-http";
import cors from "cors";

// Load environment variables
dotenv.config();

// Import route handlers
import { handleDemo } from "./routes/demo";

// Users (using Supabase)
import {
  getUsers,
  getCurrentUser,
  getUserById,
  updateUserProfile,
  getTeamMembers
} from "./routes/users-supabase";

// Tasks (using Supabase)
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  updateSubtask,
  deleteTask
} from "./routes/tasks-supabase";

// Posts
import { 
  getPosts, 
  getPostById, 
  createPost, 
  updatePostReaction, 
  markPostAsRead, 
  deletePost 
} from "./routes/posts";

// Schedule
import {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  getMySchedule
} from "./routes/schedule";

// Auth
import authRoutes from "./routes/auth";
import setupRoutes from "./routes/setup";
import learningProgressRoutes from "./routes/learning-progress";
import preboardingRoutes from "./routes/preboarding";
import teamMembersRoutes from "./routes/team-members";

export function createServer() {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes

  // Demo
  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong" });
  });
  app.get("/api/demo", handleDemo);

  // Auth API
  app.use("/api/auth", authRoutes);

  // Setup API (for initial admin user creation)
  app.use("/api/setup", setupRoutes);

  // Users API
  app.get("/api/users", getUsers);
  app.get("/api/users/me", getCurrentUser);
  app.get("/api/users/team", getTeamMembers);
  app.get("/api/users/:id", getUserById);
  app.put("/api/users/:id", updateUserProfile);

  // Tasks API
  app.get("/api/tasks", getTasks);
  app.get("/api/tasks/:id", getTaskById);
  app.post("/api/tasks", createTask);
  app.put("/api/tasks/:id", updateTask);
  app.patch("/api/tasks/:id/status", updateTaskStatus);
  app.patch("/api/tasks/:id/subtasks/:subtaskId", updateSubtask);
  app.delete("/api/tasks/:id", deleteTask);

  // Posts API
  app.get("/api/posts", getPosts);
  app.get("/api/posts/:id", getPostById);
  app.post("/api/posts", createPost);
  app.post("/api/posts/reaction", updatePostReaction);
  app.patch("/api/posts/:id/read", markPostAsRead);
  app.delete("/api/posts/:id", deletePost);

  // Schedule API
  app.get("/api/schedule", getShifts);
  app.get("/api/schedule/me", getMySchedule);
  app.get("/api/schedule/:id", getShiftById);
  app.post("/api/schedule", createShift);
  app.put("/api/schedule/:id", updateShift);
  app.delete("/api/schedule/:id", deleteShift);

  // Learning Progress API
  app.use("/api/learning", learningProgressRoutes);

  // Preboarding API
  app.use("/api/preboarding", preboardingRoutes);

  // Team Members API
  app.use("/api/team-members", teamMembersRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const staticPath = path.join(process.cwd(), "dist", "spa");
    app.use(express.static(staticPath));
    
    // Serve index.html for all non-API routes (SPA routing)
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api/")) {
        res.sendFile(path.join(staticPath, "index.html"));
      }
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found'
    });
  });

  return app;
}

// Export for serverless
export const handler = serverless(createServer());

// For local development
if (process.env.NODE_ENV !== "production") {
  const app = createServer();
  const port = process.env.PORT || 8080;
  
  app.listen(port, () => {
    console.log(`🚀 Gruppy API server running on http://localhost:${port}`);
    console.log(`📊 API endpoints available at http://localhost:${port}/api/`);
    console.log(`🏥 Health check: http://localhost:${port}/api/health`);
  });
}
