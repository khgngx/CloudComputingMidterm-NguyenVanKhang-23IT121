const express = require('express');

const router = express.Router();
const ACCOUNTS = ['reader', 'writer'];

// Stores the active account in the Atlas-backed session so it survives restarts and scaling.
router.post('/', (req, res) => {
  const { account } = req.body;
  if (!ACCOUNTS.includes(account)) {
    return res.status(400).render('error', { message: 'Tài khoản không hợp lệ.' });
  }
  req.session.account = account;
  res.redirect('/');
});

module.exports = router;
