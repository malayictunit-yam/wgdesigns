#!/usr/bin/env node
// Build-time environment variable check for Vercel deployments.
// Fails the build early with a clear message if any required variable is missing.

if (!process.env.VERCEL) {
  console.log("[vercel-env-check] Not running on Vercel, skipping check.");
  process.exit(0);
}

const required = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "LOVABLE_API_KEY",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[vercel-env-check] Missing required environment variables for this deployment: ${missing.join(
      ", "
    )}`
  );
  console.error(
    "[vercel-env-check] Add them in the Vercel dashboard: Project → Settings → Environment Variables."
  );
  console.error(
    "[vercel-env-check] See .env.example in the repo for the full list and descriptions."
  );
  process.exit(1);
}

console.log("[vercel-env-check] All required environment variables are present.");
