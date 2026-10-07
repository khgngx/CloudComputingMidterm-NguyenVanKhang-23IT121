const express = require('express');
const { BookRead, BookWrite } = require('../models/Book');
const validateCode = require('../middleware/validateCode');
const { VAT } = require('../config/student');
const { writeUser } = require('../config/db');

const router = express.Router();

// READ -> reader account
router.get('/', async (req, res) => {
  const books = await BookRead.find().sort({ createdAt: -1 }).lean();
  const { flash } = req.session;
  delete req.session.flash;
  res.render('books', { books, flash });
});

// WRITE -> writer account
router.post('/', validateCode, async (req, res) => {
  const price = Number(req.body.price);
  if (req.body.price === '' || !Number.isFinite(price) || price < 0) {
    return res.status(400).render('error', { message: 'Giá phải là số không âm.' });
  }
  const title = String(req.body.title || '').trim();
  const author = String(req.body.author || '').trim();
  if (!title || !author) {
    return res.status(400).render('error', { message: 'Tên sách và tác giả là bắt buộc.' });
  }

  const priceAfterVat = Math.round(price * (1 + VAT / 100) * 100) / 100;
  try {
    await BookWrite.create({ code: req.body.code, title, author, price, vat: VAT, priceAfterVat });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .render('error', { message: `Mã sản phẩm "${req.body.code}" đã tồn tại.` });
    }
    throw err;
  }
  req.session.flash = `Đã thêm sách "${req.body.code}" (giá sau VAT ${priceAfterVat}) bằng tài khoản ghi ${writeUser}.`;
  res.redirect('/');
});

module.exports = router;
