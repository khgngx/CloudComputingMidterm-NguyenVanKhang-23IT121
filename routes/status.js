const express = require('express');
const { readConn, writeConn, readUser, writeUser } = require('../config/db');

const router = express.Router();

// Asks Atlas which user/roles each connection authenticated as, proving the Read/Write split.
async function describe(conn, username) {
  const { authInfo } = await conn.db.command({ connectionStatus: 1 });
  return { username, roles: authInfo.authenticatedUserRoles };
}

router.get('/', async (req, res) => {
  const [reader, writer] = await Promise.all([
    describe(readConn, readUser),
    describe(writeConn, writeUser),
  ]);
  res.json({
    reader,
    writer,
    session: { store: 'MongoDB Atlas', collection: 'sessions', views: req.session.views },
  });
});

module.exports = router;
