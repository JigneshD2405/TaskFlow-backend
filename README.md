# TaskFlow — Backend

Node.js + Express REST API with Socket.io real-time support for the TaskFlow kanban app.

---

## Tech Stack

- **Node.js** with ES Modules
- **Express.js 5**
- **MongoDB** + **Mongoose 8**
- **Socket.io 4** — real-time board sync
- **JWT** — access token (15 min) + refresh token (7 days)
- **bcrypt** — password hashing
- **Joi** — request validation
- **Winston** — logging

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Installation

```bash
cd TaskFlow-backend
npm install
```

### Environment Variables

Create a `.env` file in the root of `TaskFlow-backend`:

```env
PORT=8080
NODE_ENV=development

MONGO_URL=mongodb://localhost:27017/taskboard

JWT_SECRET=your_secret_key_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

FRONTEND_URL=http://localhost:3000
```

> **Note:** If you are using MongoDB Atlas replace `MONGO_URL` with your Atlas connection string.

> **Note:** MongoDB transactions (used in card move, column delete, board delete) require a **replica set**. For local dev run MongoDB with `mongod --replSet rs0` and then run `rs.initiate()` once in mongosh. Atlas supports transactions out of the box.

### Run the server

```bash
# development (auto-restart on file change)
npm run dev

# production
npm start
```

Server starts at `http://localhost:8080`

---

## Seed Dummy Data

If you want some initial data to test with, run the seed script:

```bash
npm run seed
```

This creates **4 users**, **3 boards**, **11 columns**, and **27 cards**. It is safe to run multiple times — it will never create duplicate entries.

**Login credentials after seed:**

| Email | Password |
|---|---|
| alice@taskflow.dev | Password@123 |
| bob@taskflow.dev | Password@123 |
| clara@taskflow.dev | Password@123 |
| david@taskflow.dev | Password@123 |

---

## Project Structure

```
TaskFlow-backend/
├── index.js                    # Entry point
├── seed.js                     # Seed script
├── .env                        # Environment variables
│
├── Boot/
│   ├── Node.js                 # Global singleton (all libs attached here)
│   └── Server.js               # App initialization sequence
│
├── Library/
│   ├── mongodb.js              # MongoDB connection
│   ├── http.js                 # HTTP server setup
│   ├── socket.js               # Socket.io setup + auth middleware
│   ├── routes.js               # Auto-loads all route files
│   └── load.js                 # Auto-loads all module files
│
└── App/
    ├── HttpResponse/
    │   ├── Index.js            # HTTP error classes + status codes
    │   └── Response.js         # Response formatter
    │
    ├── Middlewares/
    │   ├── Middleware.js       # Auth middleware (JWT verify)
    │   └── RouteMiddleware.js  # Param sanitization
    │
    ├── Utils/
    │   └── Index.js            # JWT helpers, bcrypt, withTransaction, withSocketEmit
    │
    └── Modules/
        ├── Models/             # Mongoose schemas
        │   ├── User.model.js
        │   ├── Board.model.js
        │   ├── Column.model.js
        │   └── Card.model.js
        │
        ├── Validators/         # Joi validation schemas
        ├── Controllers/        # Request handlers
        ├── Services/           # Business logic
        └── Routes/             # Express route definitions
```

---

## API Endpoints

All routes are prefixed with `/api/v1`.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create account |
| POST | `/sign-in` | No | Login, returns access token |
| POST | `/refresh-token` | No | Refresh access token using cookie |
| POST | `/sign-out` | Yes | Logout, clears refresh token |
| GET | `/auth` | Yes | Get current user info |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/search?q=` | Yes | Search users by name or email (max 50 results) |

### Boards

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/boards` | Yes | List boards you own or are a member of |
| POST | `/boards` | Yes | Create a board |
| GET | `/boards/:id` | Yes | Get board with columns, cards, and populated members |
| PATCH | `/boards/:id` | Yes | Update board title, description, or members |
| DELETE | `/boards/:id` | Yes | Delete board (cascades to columns + cards) |

### Columns

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/boards/:id/columns` | Yes | Create column in a board |
| PATCH | `/columns/:id` | Yes | Update column title |
| DELETE | `/columns/:id` | Yes | Delete column (cascades to cards) |

### Cards

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/columns/:id/cards` | Yes | Create card in a column |
| PATCH | `/cards/:id` | Yes | Update card |
| DELETE | `/cards/:id` | Yes | Delete card |
| POST | `/cards/:id/move` | Yes | Move card to another column |

---

## Socket.io Events

Connect to `http://localhost:8080` — **not** `/api/v1`.

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:8080", {
  transports: ["websocket"],
  auth: { token: "Bearer <accessToken>" },
});
```

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-board` | `boardId` | Subscribe to real-time events for a board |
| `leave-board` | `boardId` | Unsubscribe |

### Server → Client (broadcast to board room)

| Event | Payload | Description |
|-------|---------|-------------|
| `column:created` | `{ column }` | A column was added |
| `column:updated` | `{ column }` | A column title was changed |
| `column:deleted` | `{ columnId }` | A column was removed |
| `card:created` | `{ card }` | A card was added |
| `card:updated` | `{ card }` | A card was updated |
| `card:deleted` | `{ cardId, columnId }` | A card was removed |
| `card:moved` | `{ card, fromColumnId, toColumnId }` | A card was moved |
| `board:deleted` | `{ boardId }` | The board was deleted |
| `user:joined` | `{ userId, boardId }` | Another user opened the board |
| `user:left` | `{ userId, boardId }` | Another user closed the board |

---

## Notes

- Access tokens expire in **15 minutes**. The frontend auto-refreshes using the httpOnly refresh token cookie.
- All deletes are **soft deletes** — `deleted: true` is set, nothing is permanently removed from the database.
- Card move and column / board delete operations use **MongoDB transactions** to keep data consistent.
- Every API request from the frontend sends an `X-Socket-Id` header so the server skips broadcasting back to the user who made the change (prevents duplicate UI updates).
