import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Routes
  
  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body) as { success: boolean; data?: { username: string; password: string; role?: string }; error?: any };
      
      if (!parsed.success || !parsed.data) {
        return res.status(400).json({ error: "Invalid input" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByUsername(parsed.data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

      // Create user
      const user = await storage.createUser({
        username: parsed.data.username,
        password: hashedPassword,
        role: parsed.data.role || "patient",
      });

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Compare passwords
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // In a real app, set session/JWT here
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get all exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const exs = await storage.getExercises();
      res.json(exs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch exercises" });
    }
  });

  // Get user's sessions
  app.get("/api/users/:userId/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessionsByUser(req.params.userId);
      res.json(sessions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get user's progress analytics
  app.get("/api/users/:userId/analytics", async (req, res) => {
    try {
      const sessions = await storage.getSessionsByUser(req.params.userId);
      
      if (sessions.length === 0) {
        return res.json({
          totalSessions: 0,
          avgStability: 0,
          avgSmoothness: 0,
          avgAccuracy: 0,
          avgJitter: 0,
          trend: 'stable',
          recentSessions: []
        });
      }

      // Calculate aggregates
      const stabilities = sessions.map(s => parseFloat(s.stability as any) || 0);
      const smoothness = sessions.map(s => parseFloat(s.smoothness as any) || 0);
      const accuracy = sessions.map(s => parseFloat(s.accuracy as any) || 0);
      const jitter = sessions.map(s => parseFloat(s.jitter as any) || 0);

      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

      // Determine trend (compare first vs last 3)
      const getRecent = (arr: number[], n: number) => arr.slice(-n);
      const recentStability = getRecent(stabilities, Math.min(3, stabilities.length));
      const previousStability = getRecent(stabilities, Math.min(6, stabilities.length)).slice(0, -Math.min(3, stabilities.length));
      
      let trend = 'stable';
      if (recentStability.length > 0 && previousStability.length > 0) {
        const recentAvg = avg(recentStability);
        const previousAvg = avg(previousStability);
        if (recentAvg > previousAvg + 5) trend = 'improving';
        else if (recentAvg < previousAvg - 5) trend = 'declining';
      }

      res.json({
        totalSessions: sessions.length,
        avgStability: Math.round(avg(stabilities)),
        avgSmoothness: Math.round(avg(smoothness)),
        avgAccuracy: Math.round(avg(accuracy)),
        avgJitter: Math.round(avg(jitter)),
        trend,
        recentSessions: sessions.slice(-5)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Create a new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const session = await storage.createSession(req.body);
      
      // Update aggregated progress metrics
      await storage.updateProgress(req.body.userId, req.body.exerciseId, session);
      
      res.json(session);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Get user profile
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put("/api/users/:userId", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.userId, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Get therapist's patients
  app.get("/api/therapists/:therapistId/patients", async (req, res) => {
    try {
      const patients = await storage.getPatientsByTherapist(req.params.therapistId);
      // Don't send passwords
      const patientsWithoutPasswords = patients.map(({ password, ...rest }) => rest);
      res.json(patientsWithoutPasswords);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  // Get therapist notes for a patient
  app.get("/api/patients/:patientId/notes", async (req, res) => {
    try {
      const notes = await storage.getTherapistNotesByPatient(req.params.patientId);
      res.json(notes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  // Create therapist note
  app.post("/api/patients/:patientId/notes", async (req, res) => {
    try {
      const note = await storage.createTherapistNote({
        ...req.body,
        patientId: req.params.patientId,
      });
      res.json(note);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    // In a real app with sessions/JWT, you'd invalidate the token here
    res.json({ message: "Logged out successfully" });
  });

  return httpServer;
}
