# Secure Notes API

A Notes API built with Express, MongoDB, and JSON Web Tokens (JWT).
Users can register, log in, and manage **only their own** notes.

This is Lab 2 (Secure Record Storage) from Module 14: Authentication and Authorization.

## The problem this fixes

The starter API made you log in, but once you were logged in, you could view, update,
or delete **anyone's** notes. This project adds **ownership-based authorization**:

- Every note stores the `_id` of the user who created it.
- `GET /api/notes` returns only your notes.
- `PUT` and `DELETE` check who owns the note first, and send back **403 Forbidden** if it isn't yours.

## Tech used

- **Node.js** + **Express 5**: server and routes
- **MongoDB Atlas** + **Mongoose 9**: database and models
- **bcrypt**: hashes passwords before saving
- **jsonwebtoken**: makes and checks login tokens
- **dotenv**: loads secrets from `.env`
- ES modules (`import` / `export`)

## Project structure

```
secure-notes/
├── server.js               # starts Express and waits for the database
├── config/
│   └── connection.js       # connects to MongoDB
├── models/
│   ├── index.js            # exports User and Note together
│   ├── User.js             # user schema + password hashing
│   └── Note.js             # note schema with a required `user` owner field
├── utils/
│   └── auth.js             # signToken + authMiddleware (checks the JWT)
└── routes/
    ├── index.js            # mounts /api and the 404 page
    └── api/
        ├── index.js        # mounts /users and /notes
        ├── userRoutes.js   # register + login
        └── noteRoutes.js   # note CRUD with ownership checks
```

## Setup

1. Clone the repo and install packages:

   ```bash
   npm install
   ```

2. Make a `.env` file in the project folder:

   ```
   MONGO_URI=your-mongodb-atlas-connection-string/notesdb
   JWT_SECRET=a-long-random-secret
   ```

3. Start the server:

   ```bash
   npx nodemon server.js
   ```

   You should see: `🌍 Now listening on localhost:3001`

## API endpoints

### Users (no token needed)

| Method | Route | Body | What it does |
|---|---|---|---|
| POST | `/api/users/register` | `{ "username", "email", "password" }` | Makes a user and returns a token |
| POST | `/api/users/login` | `{ "email", "password" }` | Logs in and returns a token |

### Notes (token required)

Send your token in the header:

```
Authorization: Bearer <your token>
```

| Method | Route | What it does |
|---|---|---|
| GET | `/api/notes` | Gets **only your** notes |
| POST | `/api/notes` | Makes a note owned by you. Body: `{ "title", "content" }` |
| PUT | `/api/notes/:id` | Updates your note. **403** if it isn't yours |
| DELETE | `/api/notes/:id` | Deletes your note. **403** if it isn't yours |

### Status codes

| Code | Meaning |
|---|---|
| 200 / 201 | Success |
| 400 | Bad input, or wrong email/password |
| 401 | No token, or a bad token |
| 403 | You're logged in, but the note isn't yours |
| 404 | No note with that id |

## How the ownership check works

```js
// 1. find the note (don't change it yet)
const note = await Note.findById(req.params.id);

// 2. it doesn't exist → 404
if (!note) return res.status(404).json({ ... });

// 3. it isn't yours → 403
if (note.user.toString() !== req.user._id) return res.status(403).json({ ... });

// 4. it's yours → update or delete it
```

`note.user` is a Mongo ObjectId, and `req.user._id` is a string from the token,
so `.toString()` turns the ObjectId into text before comparing.

## Testing with two users

1. Register **User A** and **User B**. Save both tokens.
2. As User A, `POST /api/notes` to make a note. Copy its `_id`.
3. As User B, `GET /api/notes`. User A's note should **not** show up.
4. As User B, `PUT` and `DELETE` `/api/notes/<User A's note id>`. Both should return **403**.
5. As User A, do the same `PUT` and `DELETE`. Both should work.
