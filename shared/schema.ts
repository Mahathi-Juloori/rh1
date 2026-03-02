import { sql } from "drizzle-orm";
import {
  pgTable,
  type PgTableWithColumns,
  text,
  varchar,
  numeric,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (therapists and patients)
export const users: PgTableWithColumns<any> = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  role: text("role").notNull().default("patient"), // 'patient' or 'therapist'
  age: integer("age"),
  condition: text("condition"), // medical condition for patients
  therapistId: varchar("therapist_id").references(() => users.id), // assigned therapist
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exercises table
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // 'Line', 'Circle', 'Square'
  description: text("description"),
  difficulty: text("difficulty").notNull().default("easy"), // 'easy', 'medium', 'hard'
  instructions: text("instructions"), // step-by-step instructions
  targetShape: text("target_shape"), // JSON string defining the ideal shape
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercise Sessions (individual session records)
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  exerciseId: varchar("exercise_id")
    .notNull()
    .references(() => exercises.id),
  completionTime: numeric("completion_time"), // seconds
  stability: numeric("stability"), // 0-100 score
  smoothness: numeric("smoothness"), // 0-100 score
  accuracy: numeric("accuracy"), // 0-100 score
  jitter: numeric("jitter"), // 0-100 score (inverse of tremor)
  pathData: text("path_data"), // JSON string of finger positions
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Patient Progress (aggregated metrics)
export const progress = pgTable("progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  exerciseId: varchar("exercise_id")
    .notNull()
    .references(() => exercises.id),
  avgStability: numeric("avg_stability"), // Average stability score
  avgSmoothness: numeric("avg_smoothness"), // Average smoothness score
  avgAccuracy: numeric("avg_accuracy"),
  totalSessions: integer("total_sessions").default(0),
  lastSessionDate: timestamp("last_session_date"),
  improvementTrend: text("improvement_trend"), // 'improving', 'declining', 'stable'
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Therapist Notes
export const therapistNotes = pgTable("therapist_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  therapistId: varchar("therapist_id")
    .notNull()
    .references(() => users.id),
  patientId: varchar("patient_id")
    .notNull()
    .references(() => users.id),
  sessionId: varchar("session_id").references(() => sessions.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  name: true,
  description: true,
  difficulty: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  exerciseId: true,
  completionTime: true,
  stability: true,
  smoothness: true,
  accuracy: true,
  jitter: true,
  notes: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type TherapistNote = typeof therapistNotes.$inferSelect;
