# Secure Web Portal

A secure Express API where users can register, log in with **email and password** or with **GitHub**,
and manage a private collection of **bookmarks**. Users can only see and change their own bookmarks.

This is the Module 14 SBA (Authentication and Authorization) for "Innovate Inc."

## Features

- **Local auth:** register and log in with email and password. Passwords are hashed with bcrypt.
- **GitHub login (OAuth 2.0):** log in with GitHub through Passport (`passport-github2`).
- **JWT tokens:** both login types return a signed JSON Web Token (expires in 2 hours).
- **Linked accounts:** if a GitHub user's email matches an existing local account, the GitHub account is linked to it.
- **Protected bookmarks:** every bookmark route needs a valid token (**401** without one).
- **Ownership checks:** you can only view, update, or delete your own bookmarks (**403** otherwise).

## Tech used

- **Node.js** + **Express 5**
- **MongoDB Atlas** + **Mongoose 9**
- **bcrypt**: password hashing
- **jsonwebtoken**: signing and checking tokens
- **passport** + **passport-github2**: GitHub OAuth
- **dotenv**: loads secrets from `.env`
- ES modules (`import` / `export`)

## Project structure

```
Secure-Web-Portal/
├── server.js                 # starts Express, turns on passport, waits for the database
├── config/
│   ├── connection.js         # connects to MongoDB
│   └── passport.js           # GitHub strategy: find, link, or create the user
├── models/
│   ├── index.js              # exports User and Bookmark together
│   ├── User.js               # local + GitHub users (password OR githubId)
│   └── Bookmark.js           # title, url, and the owner's user id
├── utils/
│   └── auth.js               # signToken + authMiddleware (checks the JWT)
└── routes/
    ├── index.js              # mounts /api and the 404 page
    └── api/
        ├── index.js          # mounts /users and /bookmarks
        ├── userRoutes.js     # register, login, GitHub OAuth
        └── bookmarkRoutes.js # bookmark CRUD with ownership checks
```

## Setup

1. Clone the repo and install packages:

   ```bash
   npm install
   ```

2. Register a GitHub OAuth App (GitHub → Settings → Developer settings → OAuth Apps → New OAuth App):
   - **Homepage URL:** `http://localhost:3001`
   - **Authorization callback URL:** `http://localhost:3001/api/users/auth/github/callback`

3. Make a `.env` file in the project folder:

   ```
   MONGO_URI=your-mongodb-atlas-connection-string
   PORT=3001
   JWT_SECRET=a-long-random-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_CALLBACK_URL=http://localhost:3001/api/users/auth/github/callback
   ```

4. Start the server:

   ```bash
   npx nodemon server.js
   ```

   You should see: `🌍 Now listening on localhost:3001`

## API endpoints

### Users

| Method | Route | Body | What it does |
|---|---|---|---|
| POST | `/api/users/register` | `{ "username", "email", "password" }` | Makes a local user and returns a token |
| POST | `/api/users/login` | `{ "email", "password" }` | Logs in and returns a token |
| GET | `/api/users/auth/github` | — | Sends you to GitHub to log in (open it in a browser) |
| GET | `/api/users/auth/github/callback` | — | GitHub sends you back here, and the response is `{ token, user }` |

### Bookmarks (token required)

Send your token in the header:

```
Authorization: Bearer <your token>
```

| Method | Route | What it does |
|---|---|---|
| GET | `/api/bookmarks` | Gets **only your** bookmarks |
| GET | `/api/bookmarks/:id` | Gets one of your bookmarks. **403** if it isn't yours |
| POST | `/api/bookmarks` | Makes a bookmark owned by you. Body: `{ "title", "url" }` |
| PUT | `/api/bookmarks/:id` | Updates your bookmark. **403** if it isn't yours |
| DELETE | `/api/bookmarks/:id` | Deletes your bookmark. **403** if it isn't yours |

### Status codes

| Code | Meaning |
|---|---|
| 200 / 201 | Success |
| 400 | Bad input (like a missing password or url), or wrong email/password |
| 401 | No token, or a bad token |
| 403 | You're logged in, but the bookmark isn't yours |
| 404 | No bookmark with that id |

## How GitHub login works

1. The user opens `/api/users/auth/github` and is sent to GitHub.
2. They click **Authorize**, and GitHub sends them back to the callback URL.
3. `config/passport.js` looks for the user:
   - **found by `githubId`?** Log them in (returning user).
   - **found by email?** Attach the `githubId` to that local account (linked account).
   - **nobody?** Create a new user with no password.
4. The app signs its own JWT and returns `{ token, user }`.

If a GitHub account has no public email, the app asks GitHub for it with the `user:email` scope.
If there's still no email, it uses `username@users.noreply.github.com`.

## How the ownership check works

```js
const bookmark = await Bookmark.findById(req.params.id);          // 1. find it
if (!bookmark) return res.status(404).json({ ... });              // 2. missing → 404
if (bookmark.user.toString() !== req.user._id)                    // 3. not yours → 403
  return res.status(403).json({ ... });
// 4. it's yours → send, update, or delete it
```

`bookmark.user` is a Mongo ObjectId and `req.user._id` is a string from the token,
so `.toString()` turns the ObjectId into text before comparing.

## Testing

Tested with Postman, curl, and a browser (for GitHub login):

- Register, then log in, gets a token. The password is stored hashed.
- A duplicate email, a missing password, or a wrong password returns **400**.
- Bookmarks with no token or a fake token return **401**.
- GitHub login in the browser returns a token, and that token works on `/api/bookmarks`.
- With two users, **B** gets an empty list and gets **403** when viewing, updating, or deleting **A's** bookmark.
- **A** can view, update, and delete A's own bookmark, and a deleted bookmark returns **404**.
