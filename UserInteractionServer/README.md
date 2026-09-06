# User Interaction Server

A production-ready microservice built with **Node.js**, **Express**, and **TypeScript**.

---

## 🛠️ Tech Stack & Features

- **Runtime:** Node.js (LTS v22+)
- **Language:** TypeScript 5+ (Strict mode & NodeNext resolution)
- **Framework:** Express
- **Security:** Helmet, CORS
- **Logging:** Pino & Pino-pretty
- **Validation:** Zod schema-based validation
- **Dev Runner:** `tsx` (Ultra-fast TypeScript execution & hot reload)
- **Error Handling:** Centralized custom error classes and global error middleware
- **Lifecycle:** Graceful shutdown handling (`SIGINT`, `SIGTERM`)

---

## 📁 Project Structure

```text
UserInteractionServer/
├── src/
│   ├── config/             # Environment validation & configuration
│   │   └── env.ts
│   ├── controllers/        # Request handlers
│   │   ├── health.controller.ts
│   │   └── interaction.controller.ts
│   ├── middlewares/        # Express middlewares (Errors, 404, Zod validation)
│   │   ├── errorHandler.ts
│   │   ├── notFoundHandler.ts
│   │   └── validateRequest.ts
│   ├── routes/             # API routing
│   │   ├── health.routes.ts
│   │   ├── interaction.routes.ts
│   │   └── index.ts
│   ├── schemas/            # Zod validation schemas
│   │   └── interaction.schema.ts
│   ├── utils/              # Structured logger & custom error classes
│   │   ├── errors.ts
│   │   └── logger.ts
│   ├── app.ts              # Express application configuration
│   └── server.ts           # Server bootstrap & graceful shutdown
├── .env                    # Local environment variables
├── .env.example            # Sample environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Start Production Server
```bash
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root service info |
| `GET` | `/api/v1/health` | Health check & uptime status |
| `POST` | `/api/v1/interactions` | Log a user interaction |

### Example Request (`POST /api/v1/interactions`)
```json
{
  "userId": "user_123",
  "targetId": "post_456",
  "actionType": "like",
  "metadata": {
    "source": "mobile_app"
  }
}
```
