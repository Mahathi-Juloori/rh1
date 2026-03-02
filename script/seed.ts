import { config } from "dotenv";
config(); // Load .env file

import { storage } from "../server/storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create demo therapist
    const therapistPassword = await bcrypt.hash("password", 10);
    const therapist = await storage.createUser({
      username: "therapist1",
      password: therapistPassword,
      email: "therapist@clinic.com",
      fullName: "Dr. Sarah Chen",
      role: "therapist",
    });
    console.log("✅ Created therapist:", therapist.username);

    // Create demo patients
    const patientPassword = await bcrypt.hash("password", 10);

    const patient1 = await storage.createUser({
      username: "patient1",
      password: patientPassword,
      email: "patient1@example.com",
      fullName: "Alex Johnson",
      role: "patient",
      age: 45,
      condition: "Stroke recovery",
      therapistId: therapist.id,
    });
    console.log("✅ Created patient:", patient1.username);

    const patient2 = await storage.createUser({
      username: "patient2",
      password: patientPassword,
      email: "patient2@example.com",
      fullName: "Maria Garcia",
      role: "patient",
      age: 62,
      condition: "Parkinson's disease",
      therapistId: therapist.id,
    });
    console.log("✅ Created patient:", patient2.username);

    // Create exercises
    const circleExercise = await storage.createExercise({
      name: "Circle",
      description: "Draw a perfect circle with your index finger",
      difficulty: "easy",
      instructions: "Extend your index finger and draw a smooth circle in the air. Keep your movements steady and controlled.",
      targetShape: JSON.stringify({ type: "circle", radius: 100 }),
    });
    console.log("✅ Created exercise:", circleExercise.name);

    const squareExercise = await storage.createExercise({
      name: "Square",
      description: "Draw a square shape with your index finger",
      difficulty: "medium",
      instructions: "Extend your index finger and draw a square. Focus on sharp corners and straight lines.",
      targetShape: JSON.stringify({ type: "square", size: 150 }),
    });
    console.log("✅ Created exercise:", squareExercise.name);

    const lineExercise = await storage.createExercise({
      name: "Line",
      description: "Draw a straight horizontal line",
      difficulty: "easy",
      instructions: "Extend your index finger and draw a straight horizontal line from left to right.",
      targetShape: JSON.stringify({ type: "line", length: 200 }),
    });
    console.log("✅ Created exercise:", lineExercise.name);

    // Create some sample sessions for patient1
    const session1 = await storage.createSession({
      userId: patient1.id,
      exerciseId: circleExercise.id,
      completionTime: 25,
      stability: 78,
      smoothness: 82,
      accuracy: 85,
      pathData: JSON.stringify([]),
      notes: "Good improvement in circle stability",
    });
    await storage.updateProgress(patient1.id, circleExercise.id, session1);

    const session2 = await storage.createSession({
      userId: patient1.id,
      exerciseId: squareExercise.id,
      completionTime: 35,
      stability: 72,
      smoothness: 75,
      accuracy: 78,
      pathData: JSON.stringify([]),
      notes: "Working on corner precision",
    });
    await storage.updateProgress(patient1.id, squareExercise.id, session2);

    console.log("✅ Created sample sessions and progress data");

    // Create therapist notes
    await storage.createTherapistNote({
      therapistId: therapist.id,
      patientId: patient1.id,
      sessionId: session1.id,
      note: "Excellent progress on circle exercises. Stability has improved by 15% this week. Continue practicing daily.",
    });

    console.log("✅ Created therapist notes");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Demo Accounts:");
    console.log("Therapist: therapist1 / password");
    console.log("Patients: patient1 / password, patient2 / password");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed().catch(console.error);
