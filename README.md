# Mini Instagram (Linkon)

This repository contains a minimal Instagram-like app built with Next.js, TypeScript, Prisma (SQLite by default), NextAuth (Credentials), and Cloudinary for media uploads.

Quick start (local):

1. Install deps
   npm install

2. Create .env from .env.example and adjust values:
   - DATABASE_URL (default uses SQLite file: file:./dev.db)
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL=http://localhost:3000
   - CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)

3. Generate Prisma client & run migration
   npx prisma generate
   npx prisma migrate dev --name init

4. Seed (creates admin user dz8040231@gmail.com / yacinedz1122 and demo user demo@local / password123)
   npm run seed

5. Run dev server
   npm run dev

Open http://localhost:3000 and sign in.

Notes:
- I did NOT include any .env values or secrets in this repo. Add them in your deployment platform (Vercel) or locally in an .env file.
- For production use PostgreSQL (Supabase, Neon, or Railway). Update DATABASE_URL accordingly and run migrations & seed against that DB.

Deployment (Vercel):
- Import this GitHub repository into Vercel.
- Add environment variables in Vercel dashboard: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, CLOUDINARY_*.
- Build command: npx prisma generate && npx prisma migrate deploy && npm run build
- After deploy, run the seed script once against the production DATABASE_URL to create the admin user.

If you want I can: push more UI (sign up page, profile page, admin panel), or help connect the repo to Vercel and run migrations/seed on your production DB.
