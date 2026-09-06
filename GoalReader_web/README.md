# GoalBook (Vocal Reader) 📚⚡️

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9.1-2d3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6c47ff?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285f4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen?style=for-the-badge&logo=githubactions)](https://github.com/claver-web/Vocal_Book_Reader/actions)

> **GoalBook** (formerly Vocal Reader) is an AI-powered speed reading platform and synchronized vocal teleprompter. It transforms dense PDFs, research papers, and ebooks into an interactive, multi-sensory reading experience with smart multi-column extraction, real-time karaoke word tracking (100–500 WPM), instant Gemini AI book intelligence, and hybrid cloud/offline sync.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Data Models & Database Schema](#-data-models--database-schema)
- [Core Engineering Deep Dives](#-core-engineering-deep-dives)
  - [1. Two-Column Academic Paper Parser](#1-two-column-academic-paper-parser)
  - [2. Dual-Engine Karaoke Narration & RSVP Pacer](#2-dual-engine-karaoke-narration--rsvp-pacer)
  - [3. Hybrid Offline & Cloud Storage](#3-hybrid-offline--cloud-storage)
  - [4. Gemini AI Reading Companion](#4-gemini-ai-reading-companion)
- [REST API Endpoints](#-rest-api-endpoints)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Migration](#database-migration)
  - [Running the Development Server](#running-the-development-server)
- [Environment Variables](#-environment-variables)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [CI/CD & Deployment](#-cicd--deployment)
- [Documentation Index](#-documentation-index)
- [License](#-license)

---

## 🚀 Key Features

### 📖 Intelligent Reading & Karaoke Teleprompter
- **Word-by-Word Karaoke Synchronization**: Tracks spoken words with sub-second precision via browser speech boundary events (`onboundary`), illuminating the active word and magnifying the current sentence.
- **Adjustable Speed Pacing (100–500 WPM)**: Fine-tune reading velocity with preset speeds (*Slow: 150*, *Normal: 250*, *Fast: 350*, *Speed Read: 450*) or keyboard controls (`ArrowUp` / `ArrowDown`).
- **Hands-Free Speech Synthesis (TTS)**: Dynamic selection of installed system neural voices, with audio speed compensation calibrated to the target WPM.
- **Visual RSVP Speed Reading Mode**: Toggle TTS voice off to read visually via a high-precision cadence timer.
- **Accessibility & Typography Engine**: Includes custom font faces (Sans-Serif, Serif, Monospace, and OpenDyslexic tracking), font size scaling (`sm`, `md`, `lg`, `xl`), and a high-contrast mode (pure `#000000` with amber highlights).

### 📑 Two-Column Scientific Paper Extraction
- Solves the traditional PDF copy-paste disorder where text interleaves across columns.
- Automatically calculates horizontal spatial gutters between 46% and 54% of page width to separate two-column research formats into clean, ordered top-to-bottom reading streams.
- Intelligently extracts full-width titles and abstracts while maintaining column integrity for body text.

### 🤖 Gemini AI Reading Assistant
- **Contextual In-Book Chat**: Ask questions about the book; the assistant reads the current page context and provides precise explanations.
- **Executive Page Summaries**: One-click generation of 2-sentence executive summaries, 3 key takeaways, and an actionable reader reflection.
- **Interactive Dictionary & Vocabulary Bank**: Click any word during reading to retrieve phonetic spelling, definitions, Hindi translations, and bilingual example sentences, auto-saved to PostgreSQL.

### 📊 Reading Analytics & Gamification
- Tracks total reading minutes, books finished, average WPM, reading streaks (days), and weekly reading session charts rendered via Recharts.
- Debounced auto-save updates reading bookmarks down to the exact page, sentence, and word index.

### 🔄 Hybrid Cloud & Offline Architecture
- **Instant Offline Access**: Extracted document text is stored in browser `IndexedDB`, allowing zero-latency reading offline.
- **Multi-Device Cloud Backup**: Authenticated users have their PDFs uploaded directly to ImageKit cloud storage under user-isolated folders (`/vocal_reader/${userId}/`).

---

## 🏛 System Architecture

```mermaid
graph TD
    subgraph Client ["Client Browser (Next.js 16 + React 19)"]
        UI["User Interface / Tailwind CSS v4"]
        Reader["Reader Screen (/reader/[bookId])"]
        Hook["useVocalReader Hook"]
        TTS["Web Speech API (SpeechSynthesis)"]
        Timer["RSVP Interval Timer"]
        IDB[("IndexedDB (Full PDF Text)")]
        LS[("LocalStorage (Metadata)")]
        Parser["PDF Parser (pdfjs-dist + Column Detection)"]
    end

    subgraph AuthEdge ["Edge & Middleware"]
        Proxy["proxy.ts (Clerk Edge Middleware)"]
    end

    subgraph ServerRoutes ["Next.js Serverless API Routes"]
        APIBooks["/api/books (ImageKit List & Delete)"]
        APIDict["/api/dictionary (Gemini + Prisma Vocab)"]
        APIChat["/api/ai/chat (Gemini 2.5 Flash)"]
        APISumm["/api/ai/summarize (Gemini 2.5 Flash)"]
        APIProg["/api/user/progress (Reading State)"]
        APIAnalytics["/api/analytics (Streak & Stats)"]
        APIIK["/api/imagekit/auth (Upload Tokens)"]
    end

    subgraph ExternalCloud ["External Cloud Services"]
        Clerk["Clerk Auth Platform"]
        Gemini["Google Gemini 2.5 Flash API"]
        ImageKit["ImageKit.io CDN & Storage"]
        Postgres[("PostgreSQL Database (Neon / Supabase)")]
    end

    UI --> Reader
    Reader --> Hook
    Hook --> TTS
    Hook --> Timer
    Reader --> Parser
    Hook --> IDB
    Hook --> LS

    UI --> Proxy
    Proxy --> ServerRoutes

    APIBooks --> ImageKit
    APIIK --> ImageKit
    APIDict --> Gemini
    APIDict --> Postgres
    APIChat --> Gemini
    APISumm --> Gemini
    APIAnalytics --> Postgres
    APIProg --> Postgres
    Proxy -.-> Clerk
```

---

## 🛠 Tech Stack

| Domain | Technology | Version | Description |
|---|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) | `16.2.10` | App Router, Server Components, Turbopack, Standalone output |
| **UI Library** | [React](https://react.dev/) | `19.2.4` | Latest React concurrent features and hooks |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.x` | Strict type checking throughout |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `v4.x` | High-performance atomic styling via `@tailwindcss/postcss` |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | `12.42.2` | Fluid transitions, drawers, splash screen, and teleprompter |
| **Icons** | [Lucide React](https://lucide.dev/) | `1.23.0` | Accessible, consistent iconography |
| **PDF Parsing** | [pdfjs-dist](https://mozilla.github.io/pdf.js/) | `6.1.200` | Browser text and coordinate extraction |
| **Database ORM** | [Prisma ORM](https://www.prisma.io/) | `7.9.1` | PostgreSQL schema modeling with `@prisma/adapter-pg` driver adapter |
| **Database** | PostgreSQL | `15+` | Relational store for users, books, progress, vocabulary, and chats |
| **Authentication** | [Clerk](https://clerk.com/) | `^7.6.5` | Multi-factor auth, session management, route protection |
| **Cloud Storage** | [ImageKit](https://imagekit.io/) | `^6.0.0` | Secure PDF storage, authenticated token generation, CDN delivery |
| **Artificial Intelligence** | [Google Gemini](https://ai.google.dev/) | `2.5-flash` | Ultra-fast document comprehension, summarization, and dictionary lookups |
| **Charts** | [Recharts](https://recharts.org/) | `3.10.1` | Composed charts for reading time and WPM velocity tracking |

---

## 📂 Project Directory Structure

```plaintext
GoalReader_web/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions automated CI build & typecheck
├── app/
│   ├── (auth)/                    # Authentication route group
│   │   ├── forgot-password/       # Password recovery
│   │   ├── sign-in/               # Clerk sign-in modal/page
│   │   ├── sign-up/               # Clerk sign-up page
│   │   └── layout.tsx             # Centered authentication shell
│   ├── (dashboard)/               # Authenticated application zone
│   │   ├── ai-assistant/          # Dedicated AI reading workspace
│   │   ├── dashboard/             # Main metrics, recent books, charts
│   │   ├── library/               # Full grid of local & cloud books
│   │   ├── reader/[bookId]/       # Split-pane reading teleprompter view
│   │   └── layout.tsx             # Dashboard shell with top navigation
│   ├── (marketing)/               # Public landing and informational routes
│   │   ├── about/                 # Mission, team, technology
│   │   ├── contact/               # User feedback and support form
│   │   ├── pricing/               # Subscription tiers (Free, Pro, Scholar)
│   │   ├── privacy/               # Privacy policy & data protection
│   │   ├── terms/                 # Terms of service
│   │   ├── page.tsx               # High-converting marketing landing page
│   │   └── layout.tsx             # Marketing header and footer wrapper
│   ├── api/                       # Serverless REST endpoints
│   │   ├── ai/
│   │   │   ├── chat/route.ts      # Gemini AI reading assistant chat
│   │   │   └── summarize/route.ts # Gemini AI page summarization
│   │   ├── analytics/route.ts     # User reading time & streak stats
│   │   ├── auth/[...nextauth]/    # Auth route compatibility handler
│   │   ├── books/route.ts         # Cloud library list & delete via ImageKit
│   │   ├── dictionary/route.ts    # AI definitions & PostgreSQL vocab bank
│   │   ├── imagekit/auth/route.ts # Signed client upload token generator
│   │   └── user/progress/route.ts # Synchronized reading bookmarks
│   ├── error.tsx                  # Global error boundary UI
│   ├── globals.css                # Global CSS variables, scrollbars, themes
│   ├── layout.tsx                 # Root layout with ClerkProvider & metadata
│   ├── robots.ts                  # Dynamic SEO robots.txt generator
│   └── sitemap.ts                 # Dynamic SEO sitemap.xml generator
├── components/
│   ├── ErrorBoundary.tsx          # Class component error trap for PDF reader
│   ├── KaraokeDisplay.tsx         # Teleprompter stream with word highlighting
│   ├── LibraryGrid.tsx            # Card grid of recent and saved books
│   ├── Navbar.tsx                 # Global top navigation and Clerk user menu
│   ├── PDFUploader.tsx            # Drag-and-drop ingestion with progress states
│   ├── SidebarControls.tsx        # Desktop docked sidebar & mobile controls
│   ├── SplashScreen.tsx           # Ambient animated entrance splash
│   └── VocabularyList.tsx         # Slide-over saved words drawer
├── docs/                          # Detailed technical documentation modules
│   ├── ARCHITECTURE.md            # Deep system design and state machines
│   ├── API.md                     # Complete API endpoint specifications
│   ├── PDF_PARSER_AND_AUDIO.md    # Two-column algorithm and TTS calibration
│   └── DEPLOYMENT_AND_OPS.md      # Production rollout and maintenance
├── hooks/
│   └── useVocalReader.ts          # Core audio playback & karaoke synchronization
├── lib/
│   ├── generated/prisma/          # Generated Prisma 7 Client types
│   ├── pdfParser.ts               # Coordinate spatial sorting & segmentation
│   ├── prisma.ts                  # Singleton PrismaClient with PG adapter
│   └── storage.ts                 # Hybrid IndexedDB + LocalStorage wrapper
├── prisma/
│   └── schema.prisma              # Database schema definition
├── tests/
│   └── utils.test.mjs             # Node test runner suite for math and parser
├── types/
│   └── index.ts                   # Core TypeScript interfaces and types
├── proxy.ts                       # Clerk edge authentication middleware
├── next.config.ts                 # Next.js compiler, compression, and image hosts
├── package.json                   # Dependencies, engines, and scripts
└── vercel.json                    # Vercel deployment optimizations
```

---

## 💾 Data Models & Database Schema

Defined in [`prisma/schema.prisma`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/prisma/schema.prisma) using Prisma ORM 7:

```mermaid
erDiagram
    User ||--o{ Book : owns
    User ||--o{ ReadingProgress : tracks
    User ||--o{ AIChat : initiates
    User ||--o{ Vocabulary : saves
    User ||--o| Subscription : maintains

    User {
        string id PK
        string email UK
        string name
        string avatar
        datetime createdAt
    }

    Book {
        string id PK
        string title
        string author
        string coverUrl
        string fileUrl
        int pages
        int fileSize
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    ReadingProgress {
        string id PK
        string bookId FK
        string userId FK
        int currentPage
        int currentSentence
        int currentWord
        float completionPercentage
        float readingSpeed
        int timeSpent
        datetime lastReadAt
    }

    AIChat {
        string id PK
        string userId FK
        string bookId
        string question
        string answer
        string context
        datetime createdAt
    }

    Vocabulary {
        string id PK
        string userId FK
        string word
        string definition
        string pronunciation
        string exampleSentence
        datetime createdAt
    }

    Subscription {
        string id PK
        string userId FK "UK"
        string plan
        string status
        datetime currentPeriodEnd
    }

    SavedWord {
        string id PK
        string word
        string pronunciation
        string meaning
        string hin
        string exampleEng
        string exampleHin
        string userId
        datetime createdAt
    }
```

---

## 🔬 Core Engineering Deep Dives

### 1. Two-Column Academic Paper Parser
Standard PDF text extraction reads characters in stream order, which causes multi-column documents to concatenate line 1 of column 1 with line 1 of column 2.

In [`lib/pdfParser.ts`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/lib/pdfParser.ts), GoalBook solves this with a geometric distribution heuristic:
1. Gathers all text tokens on a page with their geometric bounding boxes `(x, y, width, height, right)`.
2. Computes the horizontal bounding envelope `[minX, maxX]` of the content area.
3. Defines a central gutter region: `leftColMaxX = minX + 0.46 * width`, `rightColMinX = minX + 0.54 * width`.
4. Evaluates tokens:
   - Tokens with `right < leftColMaxX` are assigned to `Column 1`.
   - Tokens with `x > rightColMinX` are assigned to `Column 2`.
   - Tokens spanning across the center are treated as headers or full-width banners.
5. If at least 3 distinct items exist in both columns and spanning items are minimal, the page is classified as **Two-Column**. It then orders `Spanning Headers → Column 1 (top-to-bottom) → Column 2 (top-to-bottom)`.
6. Passes the ordered string to `splitIntoSentences()`, which leverages `Intl.Segmenter` with an active regex fallback `/(?<=[.!?])\s+(?=[A-Z0-9"'([<])/`.

### 2. Dual-Engine Karaoke Narration & RSVP Pacer
Implemented in [`hooks/useVocalReader.ts`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/hooks/useVocalReader.ts):

- **Speech Synthesis (TTS) Mode**:
  - Initializes `window.speechSynthesis`.
  - Maps WPM to speech rate: `rate = Math.min(2.0, Math.max(0.7, wpm / 200))`.
  - Attaches `onboundary` listener to the `SpeechSynthesisUtterance`. As the audio driver fires boundary events, it parses character offsets to index the exact spoken word.
  - Automatically advances to the next sentence and page sequentially.
- **RSVP Visual Pacer Mode**:
  - If the user mutes voice narration, the engine switches to a precision timer:
    $$\Delta t = \frac{60}{\text{WPM}} \times 1000 \text{ ms}$$
  - Increments word indices at precise cadences without sound, ideal for silent speed reading.

### 3. Hybrid Offline & Cloud Storage
In [`lib/storage.ts`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/lib/storage.ts):
- **Local IndexedDB (`VocalReaderDB`)**: Stores complete `PDFDocumentData` objects including parsed sentence structures. Opening a 200-page book occurs in under 15ms with zero network requests.
- **Local Storage**: Maintains lightweight cache of recently read books, bookmarks, and last-read timestamps.
- **ImageKit Cloud Storage**: Books uploaded by authenticated users are streamed to `/vocal_reader/${userId}/` via signed authentication parameters generated in [`app/api/imagekit/auth/route.ts`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/app/api/imagekit/auth/route.ts).

### 4. Gemini AI Reading Companion
Integrated via serverless routes:
- [`app/api/ai/chat/route.ts`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/app/api/ai/chat/route.ts): Uses `gemini-2.5-flash` with a low temperature (`0.3`) to deliver grounded answers based on the currently displayed 4,000 characters of book context.
- [`app/api/ai/summarize/route.ts`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/app/api/ai/summarize/route.ts): Produces structured 2-sentence executive overviews, 3 analytical bullets, and 1 reader reflection.
- [`app/api/dictionary/route.ts`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/app/api/dictionary/route.ts): Generates JSON definitions containing English meanings, Hindi translations, and bilingual examples, persisting entries to the `SavedWord` table.

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/books` | Returns user's uploaded cloud books from ImageKit | Yes (Clerk) |
| `DELETE` | `/api/books?fileId=...` | Deletes a book from ImageKit storage | Yes (Clerk) |
| `GET` | `/api/imagekit/auth` | Generates short-lived client upload signature & token | Yes (Clerk) |
| `POST` | `/api/dictionary` | Looks up word via Gemini & persists to vocabulary bank | Optional |
| `GET` | `/api/dictionary` | Retrieves user's saved vocabulary list | Yes (Clerk) |
| `POST` | `/api/ai/chat` | Contextual Q&A on currently read passage | Optional |
| `POST` | `/api/ai/summarize` | Generates structured executive summary of text | Optional |
| `GET` | `/api/analytics` | Retrieves streak, minutes, WPM, and weekly activity | Optional |
| `POST` | `/api/analytics` | Records a completed reading session | Yes (Clerk) |
| `GET` | `/api/user/progress?bookId=...` | Fetches saved reading position bookmark | Yes (Clerk) |
| `POST` | `/api/user/progress` | Saves reading position bookmark | Yes (Clerk) |

---

## ⚡️ Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher (or `pnpm` / `yarn`)
- **PostgreSQL**: Local instance or cloud database (Neon, Supabase)
- **Clerk Account**: For user authentication
- **ImageKit Account**: For PDF cloud hosting
- **Google AI Studio API Key**: For Gemini AI features

### Installation

1. **Clone the Repository**:
   ```bash
   git clone git@github.com:claver-web/Vocal_Book_Reader.git
   cd Vocal_Book_Reader
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your credentials in `.env.local` (see [Environment Variables](#-environment-variables)).

### Database Migration

4. **Generate Prisma Client & Push Schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Running the Development Server

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create `.env.local` with the following variables:

```env
# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# PostgreSQL Database (Prisma ORM 7)
DATABASE_URL="postgresql://username:password@localhost:5432/goalbook?schema=public"

# Google Gemini AI
GEMINI_API_KEY="AIzaSy..."

# ImageKit Cloud Storage
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_..."
IMAGEKIT_PRIVATE_KEY="private_..."
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"

# Optional Analytics & Sentry
NEXT_PUBLIC_SENTRY_DSN=""
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=""
```

---

## 🧪 Testing & Quality Assurance

Run the automated test suite powered by the Node.js native test runner:

```bash
# Run unit tests
npm test

# Run TypeScript typecheck
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Execute a test production build
npm run build
```

The test suite in [`tests/utils.test.mjs`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/tests/utils.test.mjs) verifies:
- Reading time calculations across variable word counts and WPM rates.
- Sentence boundary detection and punctuation preservation.
- Document completion percentage calculations.
- Two-column spatial coordinate clustering and column separation.

---

## 🚀 CI/CD & Deployment

### Automated GitHub Actions CI
Every commit and pull request to `main` triggers [.github/workflows/ci.yml](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/.github/workflows/ci.yml):
1. Checks out repository on `ubuntu-latest`.
2. Sets up Node.js 20 with caching.
3. Installs dependencies with `npm ci --legacy-peer-deps`.
4. Generates Prisma 7 client bindings (`npx prisma generate`).
5. Executes full TypeScript typecheck (`npx tsc --noEmit`).
6. Executes Next.js production build (`npm run build`).

### Vercel Deployment
The repository includes [`vercel.json`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/vercel.json) configured for Next.js App Router:
1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. Add all environment variables from `.env.local` to Vercel Project Settings.
3. Set the build command to `npm run build` and install command to `npm install`.
4. Deploy!

---

## 📚 Documentation Index

For in-depth architectural and operational guides, consult the dedicated docs:
- **[System Architecture Guide](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/docs/ARCHITECTURE.md)**: State machines, component trees, and data flows.
- **[Complete REST API Reference](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/docs/API.md)**: Request payloads, response schemas, and cURL examples.
- **[PDF Parser & Audio Engine Guide](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/docs/PDF_PARSER_AND_AUDIO.md)**: Deep dive into the spatial sorting math and speech synchronization.
- **[Deployment & Operations Manual](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/docs/DEPLOYMENT_AND_OPS.md)**: Production rollout, database management, and scaling considerations.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

