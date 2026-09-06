# GoalBook REST API Documentation 🔌

Comprehensive documentation for all serverless Next.js API endpoints in GoalBook.

---

## Base URL
```plaintext
Local Development: http://localhost:3000
Production:        https://your-domain.com
```

## Authentication
Protected routes require an active session token managed by **Clerk**. When interacting through client-side fetch or browser requests, Clerk session cookies are forwarded automatically.

---

## 1. Cloud Books (`/api/books`)

Manages cloud-stored PDF files hosted on ImageKit.

### `GET /api/books`
Retrieves a list of all PDFs uploaded by the authenticated user.

- **Authentication**: Required (Returns `{ files: [] }` if unauthenticated).
- **Query Parameters**: None.

#### Response (200 OK)
```json
{
  "files": [
    {
      "fileId": "65b1c8f...",
      "name": "Attention_Is_All_You_Need.pdf",
      "url": "https://ik.imagekit.io/your_id/vocal_reader/user_2x.../Attention_Is_All_You_Need.pdf",
      "size": 2411520,
      "createdAt": "2026-08-11T12:30:00.000Z"
    }
  ]
}
```

---

### `DELETE /api/books?fileId={fileId}`
Deletes a specific PDF file from the user's ImageKit cloud directory.

- **Authentication**: Required (`401 Unauthorized` if unauthenticated).
- **Query Parameters**:
  - `fileId` *(string, required)*: The unique ImageKit file ID to remove.

#### Example Request
```bash
curl -X DELETE "http://localhost:3000/api/books?fileId=65b1c8f..." \
  -H "Cookie: __session=..."
```

#### Response (200 OK)
```json
{
  "success": true
}
```

#### Error Response (400 Bad Request)
```json
{
  "error": "fileId is required"
}
```

---

## 2. ImageKit Client Upload Handshake (`/api/imagekit/auth`)

Generates cryptographic signatures for direct client-to-ImageKit file uploads, bypassing the Next.js server for large file uploads.

### `GET /api/imagekit/auth`
- **Authentication**: Required (`401 Unauthorized` if unauthenticated).

#### Response (200 OK)
```json
{
  "token": "d5b12850-938b-4a5f-...",
  "expire": 1723456789,
  "signature": "3c988b488ce..."
}
```

---

## 3. Dictionary & Vocabulary Bank (`/api/dictionary`)

Combines Google Gemini 2.5 Flash for contextual definitions with PostgreSQL for user vocabulary persistence.

### `POST /api/dictionary`
Looks up a word or phrase, generates pronunciation, Hindi translation, English definition, and dual-language examples, and upserts it into the database for logged-in users.

- **Authentication**: Optional (Anonymous lookups return definitions without saving to database).
- **Request Body**:
  ```json
  {
    "word": "ubiquitous"
  }
  ```

#### Response (200 OK)
```json
{
  "word": "ubiquitous",
  "pronunciation": "/juːˈbɪk.wɪ.təs/",
  "hin": "सर्वव्यापी / हर जगह मौजूद",
  "meaning": "Present, appearing, or found everywhere at the same time.",
  "exampleEng": "Smartphones have become ubiquitous in modern daily life.",
  "exampleHin": "स्मार्टफोन आधुनिक दैनिक जीवन में सर्वव्यापी हो गए हैं।"
}
```

---

### `GET /api/dictionary`
Fetches the user's historical vocabulary bank sorted by newest first.

- **Authentication**: Required (`401 Unauthorized` if unauthenticated).

#### Response (200 OK)
```json
{
  "words": [
    {
      "id": "cuid_12345",
      "word": "ephemeral",
      "pronunciation": "/ɪˈfem.ər.əl/",
      "meaning": "Lasting for a very short time; transitory.",
      "hin": "अल्पकालिक / क्षणभंगुर",
      "exampleEng": "Fame in the internet age can be remarkably ephemeral.",
      "exampleHin": "इंटरनेट के युग में प्रसिद्धि उल्लेखनीय रूप से अल्पकालिक हो सकती है।",
      "createdAt": "2026-08-11T16:20:00.000Z"
    }
  ]
}
```

---

## 4. Gemini AI Reading Companion (`/api/ai/*`)

### `POST /api/ai/chat`
Answers reader questions regarding the current book and page context.

- **Request Body**:
  ```json
  {
    "question": "What is the primary argument presented in this section?",
    "bookTitle": "Designing Data-Intensive Applications",
    "context": "Replication means keeping a copy of the same data on multiple machines that are connected via a network..."
  }
  ```

#### Response (200 OK)
```json
{
  "answer": "The primary argument presented here is that data replication across nodes is essential for achieving fault tolerance, reducing latency through geographic distribution, and scaling read throughput."
}
```

---

### `POST /api/ai/summarize`
Generates an executive synopsis of the page or text block.

- **Request Body**:
  ```json
  {
    "text": "Deep residual learning frameworks ease the training of networks that are substantially deeper...",
    "bookTitle": "Deep Residual Learning for Image Recognition",
    "pageNumber": 1
  }
  ```

#### Response (200 OK)
```json
{
  "summary": "Summary of Deep Residual Learning (Page 1):\n\n• Executive Summary: Introduces deep residual learning to resolve degradation problems in ultra-deep neural networks.\n• Key Takeaways:\n  1. Explicit residual mapping reformulates layer optimization.\n  2. Shortcut connections introduce zero parameter overhead.\n  3. Enables training beyond 100+ layers without accuracy saturation.\n• Reflection: How can residual bypass pathways simplify complex transformation pipelines in your own models?"
}
```

---

## 5. Reading Progress & Bookmarks (`/api/user/progress`)

Synchronizes reading positions across devices.

### `GET /api/user/progress?bookId={bookId}`
- **Authentication**: Required (`{ progress: null }` if unauthenticated).

#### Response (200 OK)
```json
{
  "userId": "user_2x...",
  "bookId": "Attention_Is_All_You_Need.pdf",
  "lastPage": 4,
  "lastSentenceIndex": 8,
  "lastWordIndex": 12,
  "percentage": 36.5,
  "updatedAt": "2026-09-03T12:45:00.000Z"
}
```

---

### `POST /api/user/progress`
- **Authentication**: Required (`401 Unauthorized` if unauthenticated).
- **Request Body**:
  ```json
  {
    "bookId": "Attention_Is_All_You_Need.pdf",
    "page": 4,
    "sentenceIndex": 8,
    "wordIndex": 12,
    "percentage": 36.5
  }
  ```

#### Response (200 OK)
```json
{
  "success": true,
  "progress": {
    "userId": "user_2x...",
    "bookId": "Attention_Is_All_You_Need.pdf",
    "page": 4,
    "sentenceIndex": 8,
    "wordIndex": 12,
    "percentage": 36.5,
    "updatedAt": "2026-09-03T12:45:01.000Z"
  }
}
```

---

## 6. Analytics & Streaks (`/api/analytics`)

### `GET /api/analytics`
Fetches user stats including streak days, total minutes, average WPM, and weekly breakdown.

#### Response (200 OK)
```json
{
  "userId": "user_2x...",
  "streakDays": 5,
  "totalMinutes": 142,
  "averageWpm": 275,
  "booksRead": 3,
  "pagesRead": 124,
  "wordsRead": 31200,
  "weeklyActivity": [
    { "day": "Mon", "minutes": 25 },
    { "day": "Tue", "minutes": 18 },
    { "day": "Wed", "minutes": 30 },
    { "day": "Thu", "minutes": 22 },
    { "day": "Fri", "minutes": 35 },
    { "day": "Sat", "minutes": 12 },
    { "day": "Sun", "minutes": 0 }
  ]
}
```

---

### `POST /api/analytics`
Logs completed reading session durations.

- **Request Body**:
  ```json
  {
    "minutesRead": 20,
    "wordsRead": 5200,
    "bookId": "Attention_Is_All_You_Need.pdf"
  }
  ```

#### Response (200 OK)
```json
{
  "success": true,
  "logged": {
    "minutesRead": 20,
    "wordsRead": 5200,
    "bookId": "Attention_Is_All_You_Need.pdf"
  }
}
```
