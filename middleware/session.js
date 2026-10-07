const session = require('express-session');
const { MongoStore } = require('connect-mongo');

// Sessions live in Atlas (never MemoryStore) so the app stays stateless.
// The writer account is used because the store needs insert/update/delete and a TTL index.
module.exports = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_WRITE_URI,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24,
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
});
