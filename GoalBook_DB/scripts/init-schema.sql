-- =============================================================================
-- GoalBook Database Schema Initialization (PostgreSQL)
-- Multi-Platform: Website (GoalReader_web) & Mobile App (GoalBook_MobileApp)
-- Generated from Unified Prisma Schema Specification
-- Microserver: GoalBook_DB
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS "public";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ClientPlatform') THEN
    CREATE TYPE "ClientPlatform" AS ENUM ('WEB', 'PHONE', 'IOS', 'ANDROID', 'TABLET', 'DESKTOP', 'OTHER');
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1. User Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 2. Book Table (Phone & Web)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "coverUrl" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileUri" TEXT,
    "pages" INTEGER NOT NULL DEFAULT 0,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "source" "ClientPlatform" NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 3. ReadingProgress Table (Cross-Platform Sync)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ReadingProgress" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentPage" INTEGER NOT NULL DEFAULT 1,
    "currentSentence" INTEGER NOT NULL DEFAULT 0,
    "currentWord" INTEGER NOT NULL DEFAULT 0,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "readingSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "clientPlatform" "ClientPlatform" NOT NULL DEFAULT 'WEB',
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 4. Bookmark Table (Phone & Web)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Bookmark" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "clientPlatform" "ClientPlatform" NOT NULL DEFAULT 'PHONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 5. Highlight Table (Phone & Web)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Highlight" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#F59E0B',
    "note" TEXT,
    "clientPlatform" "ClientPlatform" NOT NULL DEFAULT 'PHONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 6. ReadingSession Table (Timed Sessions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ReadingSession" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "durationMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "pagesRead" INTEGER NOT NULL DEFAULT 0,
    "wordsPerMinute" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "clientPlatform" "ClientPlatform" NOT NULL DEFAULT 'PHONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingSession_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 7. ReadingStreak Table (Daily Streak Tracking)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ReadingStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreakDays" INTEGER NOT NULL DEFAULT 0,
    "longestStreakDays" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "weeklyGoalMinutes" INTEGER NOT NULL DEFAULT 60,
    "currentWeekMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingStreak_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 8. ReaderSettings Table (Display & Audio Preferences)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ReaderSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "fontSize" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    "fontFamily" TEXT NOT NULL DEFAULT 'sans',
    "lineHeight" DOUBLE PRECISION NOT NULL DEFAULT 1.6,
    "readingSpeedWpm" INTEGER NOT NULL DEFAULT 250,
    "autoScroll" BOOLEAN NOT NULL DEFAULT true,
    "highlightColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "ttsVoice" TEXT,
    "ttsPitch" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "ttsRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "karaokeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "preferredPlatform" "ClientPlatform" NOT NULL DEFAULT 'PHONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReaderSettings_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 9. UserDevice Table (Push Tokens, Phone OS, App Version vs Web)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "UserDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "ClientPlatform" NOT NULL,
    "deviceName" TEXT,
    "deviceModel" TEXT,
    "osVersion" TEXT,
    "appVersion" TEXT,
    "pushToken" TEXT,
    "isPushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 10. AIChat Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AIChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "context" TEXT,
    "clientPlatform" "ClientPlatform" NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIChat_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 11. SavedConversation & ChatMessage Tables (AI Dialogues)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SavedConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT,
    "title" TEXT NOT NULL,
    "bookTitle" TEXT,
    "chapterTitle" TEXT,
    "clientPlatform" "ClientPlatform" NOT NULL DEFAULT 'PHONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "suggestedPrompts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "referencedPage" INTEGER,
    "selectedPassage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 12. BookChunk Table (RAG & Semantic Chunks)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "BookChunk" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "startCharIndex" INTEGER,
    "endCharIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookChunk_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 13. Vocabulary Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Vocabulary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "pronunciation" TEXT,
    "exampleSentence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 14. SavedWord Table (English-Hindi Bilingual Dictionary)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SavedWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL DEFAULT '',
    "meaning" TEXT NOT NULL,
    "hin" TEXT NOT NULL DEFAULT '',
    "exampleEng" TEXT NOT NULL DEFAULT '',
    "exampleHin" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "clientPlatform" "ClientPlatform" NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedWord_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 15. Subscription Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- Indexes and Constraints
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "ReadingStreak_userId_key" ON "ReadingStreak"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "ReaderSettings_userId_key" ON "ReaderSettings"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "SavedWord_userId_word_key" ON "SavedWord"("userId", "word");
CREATE UNIQUE INDEX IF NOT EXISTS "BookChunk_bookId_page_chunk_key" ON "BookChunk"("bookId", "pageNumber", "chunkIndex");

CREATE INDEX IF NOT EXISTS "Book_userId_idx" ON "Book"("userId");
CREATE INDEX IF NOT EXISTS "Book_title_idx" ON "Book"("title");
CREATE INDEX IF NOT EXISTS "Book_source_idx" ON "Book"("source");

CREATE INDEX IF NOT EXISTS "ReadingProgress_bookId_idx" ON "ReadingProgress"("bookId");
CREATE INDEX IF NOT EXISTS "ReadingProgress_userId_idx" ON "ReadingProgress"("userId");
CREATE INDEX IF NOT EXISTS "ReadingProgress_user_book_idx" ON "ReadingProgress"("userId", "bookId");

CREATE INDEX IF NOT EXISTS "Bookmark_bookId_idx" ON "Bookmark"("bookId");
CREATE INDEX IF NOT EXISTS "Bookmark_userId_idx" ON "Bookmark"("userId");

CREATE INDEX IF NOT EXISTS "Highlight_bookId_idx" ON "Highlight"("bookId");
CREATE INDEX IF NOT EXISTS "Highlight_userId_idx" ON "Highlight"("userId");

CREATE INDEX IF NOT EXISTS "ReadingSession_bookId_idx" ON "ReadingSession"("bookId");
CREATE INDEX IF NOT EXISTS "ReadingSession_userId_idx" ON "ReadingSession"("userId");
CREATE INDEX IF NOT EXISTS "ReadingSession_startTime_idx" ON "ReadingSession"("startTime");

CREATE INDEX IF NOT EXISTS "ReadingStreak_userId_idx" ON "ReadingStreak"("userId");
CREATE INDEX IF NOT EXISTS "ReaderSettings_userId_idx" ON "ReaderSettings"("userId");

CREATE INDEX IF NOT EXISTS "UserDevice_userId_idx" ON "UserDevice"("userId");
CREATE INDEX IF NOT EXISTS "UserDevice_platform_idx" ON "UserDevice"("platform");
CREATE INDEX IF NOT EXISTS "UserDevice_pushToken_idx" ON "UserDevice"("pushToken");

CREATE INDEX IF NOT EXISTS "AIChat_userId_idx" ON "AIChat"("userId");
CREATE INDEX IF NOT EXISTS "AIChat_bookId_idx" ON "AIChat"("bookId");

CREATE INDEX IF NOT EXISTS "SavedConversation_userId_idx" ON "SavedConversation"("userId");
CREATE INDEX IF NOT EXISTS "SavedConversation_bookId_idx" ON "SavedConversation"("bookId");
CREATE INDEX IF NOT EXISTS "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

CREATE INDEX IF NOT EXISTS "BookChunk_bookId_idx" ON "BookChunk"("bookId");

CREATE INDEX IF NOT EXISTS "Vocabulary_userId_idx" ON "Vocabulary"("userId");
CREATE INDEX IF NOT EXISTS "Vocabulary_word_idx" ON "Vocabulary"("word");

CREATE INDEX IF NOT EXISTS "SavedWord_userId_idx" ON "SavedWord"("userId");
CREATE INDEX IF NOT EXISTS "SavedWord_word_idx" ON "SavedWord"("word");

CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");

-- -----------------------------------------------------------------------------
-- Foreign Keys
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Book_userId_fkey') THEN
    ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReadingProgress_bookId_fkey') THEN
    ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReadingProgress_userId_fkey') THEN
    ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Bookmark_bookId_fkey') THEN
    ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Bookmark_userId_fkey') THEN
    ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Highlight_bookId_fkey') THEN
    ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Highlight_userId_fkey') THEN
    ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReadingSession_bookId_fkey') THEN
    ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReadingSession_userId_fkey') THEN
    ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReadingStreak_userId_fkey') THEN
    ALTER TABLE "ReadingStreak" ADD CONSTRAINT "ReadingStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReaderSettings_userId_fkey') THEN
    ALTER TABLE "ReaderSettings" ADD CONSTRAINT "ReaderSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserDevice_userId_fkey') THEN
    ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIChat_userId_fkey') THEN
    ALTER TABLE "AIChat" ADD CONSTRAINT "AIChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIChat_bookId_fkey') THEN
    ALTER TABLE "AIChat" ADD CONSTRAINT "AIChat_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SavedConversation_userId_fkey') THEN
    ALTER TABLE "SavedConversation" ADD CONSTRAINT "SavedConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SavedConversation_bookId_fkey') THEN
    ALTER TABLE "SavedConversation" ADD CONSTRAINT "SavedConversation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChatMessage_conversationId_fkey') THEN
    ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SavedConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BookChunk_bookId_fkey') THEN
    ALTER TABLE "BookChunk" ADD CONSTRAINT "BookChunk_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Vocabulary_userId_fkey') THEN
    ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_userId_fkey') THEN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

