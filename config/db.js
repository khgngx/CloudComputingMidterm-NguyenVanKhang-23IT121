const mongoose = require('mongoose');

// Reader: autoIndex/autoCreate off because this user only has the `read` role.
const readConn = mongoose.createConnection(process.env.MONGO_READ_URI, {
  autoIndex: false,
  autoCreate: false,
});
const writeConn = mongoose.createConnection(process.env.MONGO_WRITE_URI);

readConn.on('connected', () => console.log('Reader connected'));
writeConn.on('connected', () => console.log('Writer connected'));
readConn.on('error', (e) => console.error('Reader error:', e.message));
writeConn.on('error', (e) => console.error('Writer error:', e.message));

module.exports = { readConn, writeConn };
