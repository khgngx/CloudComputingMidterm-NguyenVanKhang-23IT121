# Library Manager (Cloud Computing Midterm)

A small library book manager built for the Cloud Computing midterm by **Nguyễn Văn Khang – 23IT121**.

It is an Express + Handlebars web app backed by MongoDB Atlas, designed around two cloud ideas:

- **Read/Write split** – two separate Atlas database users. Every query goes through a read-only connection; only inserts and updates use the read-write connection.
- **Stateless app** – sessions are stored in Atlas (never in process memory), so the app survives restarts and can scale horizontally.

## Features

- List books, sorted by product code, and search by exact product code
- Add a book and edit its title, author and price (Writer account only)
- Product code validation: codes must look like `121-001`, where the prefix is the last three digits of the student ID
- VAT is derived from the student ID (`last digit + 4`, so 5% for `23IT121`) and the price after VAT is recomputed on every write
- Account switcher between **Reader** (view only) and **Writer** (librarian); the restriction is enforced on the server, not just hidden in the UI
- `/status` reports which Atlas user and roles each connection is authenticated as
- `/healthz` for uptime checks

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Web | Express 5, express-handlebars |
| Database | MongoDB Atlas via Mongoose (two connections) |
| Sessions | express-session + connect-mongo |

## Getting started

Prerequisites: Node.js 18 or newer, and a MongoDB Atlas cluster with two database users on the same database – one with the `read` role and one with `readWrite`.

```bash
npm install
cp .env.example .env
npm run dev
```

Fill in `.env` before starting, then open <http://localhost:3000>. Use `npm start` to run without nodemon.

### Environment variables

| Variable | Description |
|---|---|
| `MONGO_READ_URI` | Connection string of the read-only Atlas user |
| `MONGO_WRITE_URI` | Connection string of the read-write Atlas user (also used by the session store) |
| `SESSION_SECRET` | Long random string used to sign the session cookie |
| `STUDENT_NAME` | Name shown in the UI |
| `STUDENT_ID` | Student ID; drives the product code prefix and the VAT rate |
| `PORT` | Port to listen on (default `3000`) |

Set `NODE_ENV=production` when deploying behind HTTPS so the session cookie is marked `secure`.

## Routes

| Method | Path | Account | Description |
|---|---|---|---|
| GET | `/` | Reader | List books; `?code=121-001` narrows to one book |
| POST | `/` | Writer | Add a book |
| POST | `/books/:code` | Writer | Update title, author and price |
| POST | `/account` | – | Switch the active account (`reader` or `writer`) |
| GET | `/status` | – | JSON with the authenticated user and roles of each connection |
| GET | `/healthz` | – | Returns `ok` |

## Project structure

```
config/       Atlas connections and per-student rules (code prefix, VAT)
middleware/   Session store, Writer guard, product code validation
models/       Book schema, bound once to each connection
routes/       Books, account switch, status
views/        Handlebars layout, pages and partials
server.js     App entry point
```
