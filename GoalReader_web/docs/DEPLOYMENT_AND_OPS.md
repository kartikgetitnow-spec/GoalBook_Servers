# Deployment & Operations Manual 🚀🛠️

Comprehensive production operations, provisioning, database management, and deployment guide for GoalBook.

---

## 1. Cloud Architecture Overview

| Component | Recommended Provider | Tier / Configuration |
|---|---|---|
| **Web & API Hosting** | [Vercel](https://vercel.com/) | Pro or Hobby (Node.js 20 runtime, Turbopack) |
| **Relational Database** | [Neon](https://neon.tech/) / [Supabase](https://supabase.com/) | Serverless PostgreSQL 15+ (Pooled connection string) |
| **Authentication** | [Clerk](https://clerk.com/) | Standard (JWT session tokens, Hosted Sign-in) |
| **Object Storage** | [ImageKit.io](https://imagekit.io/) | Default (CDN delivery, Private API keys) |
| **AI Processing** | [Google AI Studio](https://aistudio.google.com/) | Gemini 2.5 Flash API key |

---

## 2. PostgreSQL & Prisma ORM 7 Setup

GoalBook uses **Prisma ORM 7** configured with the `@prisma/adapter-pg` driver adapter.

### Database Connection String
Ensure you have a PostgreSQL connection string in your `.env.local` or production environment:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require"
```

### Initializing and Pushing Schema
To synchronize the schema with your production database:
```bash
# Generate the Prisma client bindings into lib/generated/prisma
npx prisma generate

# Push schema directly to database (ideal for prototypes and serverless)
npx prisma db push

# Or generate and run a SQL migration file for versioned migrations
npx prisma migrate dev --name init
```

### Prisma Studio (GUI Database Inspector)
To view and edit records visually in local development:
```bash
npx prisma studio
```

---

## 3. ImageKit Cloud Storage Configuration

ImageKit hosts uploaded PDF books and generates CDN URLs.

1. Create a free account at [imagekit.io](https://imagekit.io/).
2. In the ImageKit Dashboard:
   - Copy your **Public Key**, **Private Key**, and **URL-Endpoint**.
3. Under **Settings > Webhook / CORS Settings**:
   - Ensure `https://your-domain.com` (and `http://localhost:3000` for development) is added to allowed origins for direct browser uploads.
4. Set the corresponding environment variables:
   ```env
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_..."
   IMAGEKIT_PRIVATE_KEY="private_..."
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/<your_id>"
   ```

---

## 4. Clerk Authentication Configuration

1. Create a project in [dashboard.clerk.com](https://dashboard.clerk.com/).
2. Copy your **Publishable Key** and **Secret Key**.
3. Configure Redirect URLs in the Clerk Dashboard:
   - **Sign-in URL**: `/sign-in`
   - **Sign-up URL**: `/sign-up`
   - **After sign-in URL**: `/dashboard`
   - **After sign-up URL**: `/dashboard`
4. In `proxy.ts`, Clerk edge middleware intercepts all requests:
   - Public paths (`/`, `/about`, `/pricing`, etc.) are open.
   - Private paths (`/dashboard`, `/library`, `/reader/*`, `/api/*`) require a valid session.

---

## 5. Google Gemini AI Configuration

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Create an API key.
3. Add `GEMINI_API_KEY="AIzaSy..."` to your environment variables.
4. GoalBook leverages `gemini-2.5-flash:generateContent`:
   - Fast token generation (< 1.5s latency).
   - Generous free-tier rate limits.
   - Native JSON output mode used for dictionary translations.

---

## 6. Vercel Deployment Guide

GoalBook is optimized out-of-the-box for deployment on Vercel via [`vercel.json`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/vercel.json).

### Step-by-Step Deployment:
1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Open the [Vercel Dashboard](https://vercel.com/new) and select **Add New Project**.
3. Import the `Vocal_Book_Reader` repository.
4. Configure Build Settings:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
5. Configure Environment Variables in the Vercel Project UI:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
   - `IMAGEKIT_PRIVATE_KEY`
   - `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
6. Click **Deploy**.

---

## 7. Performance & Production Checklist

- [x] **Next.js Gzip/Brotli Compression**: Enabled in `next.config.ts` (`compress: true`).
- [x] **Image Optimization**: Hostnames `ik.imagekit.io`, `img.clerk.com`, and `images.unsplash.com` configured with AVIF and WebP formats.
- [x] **Client-Side PDF Parsing**: Large 50MB PDFs are processed in browser WebAssembly memory without consuming server CPU or memory.
- [x] **Debounced Persistence**: Local storage and IndexedDB writes throttled at 1,000ms intervals to prevent UI frame drops.
- [x] **CI/CD Typechecking**: GitHub Actions runs `npx tsc --noEmit` and `npm run build` on every push to maintain code health.
