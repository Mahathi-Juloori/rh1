CREATE TABLE IF NOT EXISTS "sessions_new" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "exercise_id" varchar NOT NULL REFERENCES "exercises"("id"),
  "completion_time" numeric,
  "stability" numeric,
  "smoothness" numeric,
  "accuracy" numeric,
  "jitter" numeric,
  "path_data" text,
  "notes" text,
  "created_at" timestamp DEFAULT now()
);

-- Copy existing data if table exists
INSERT INTO "sessions_new" 
SELECT "id", "user_id", "exercise_id", "completion_time", "stability", "smoothness", "accuracy", 0, "path_data", "notes", "created_at"
FROM "sessions"
ON CONFLICT DO NOTHING;

-- Drop old table and rename new one
DROP TABLE IF EXISTS "sessions";
ALTER TABLE "sessions_new" RENAME TO "sessions";
