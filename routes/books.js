const express = require('express');
const { BookRead, BookWrite } = require('../models/Book');
const validateCode = require('../middleware/validateCode');
const requireWriter = require('../middleware/requireWriter');
const { VAT } = require('../config/student');
const { readUser, writeUser } = require('../config/db');

const router = express.Router();

const priceWithVat = (price) => Math.round(price * (1 + VAT / 100) * 100) / 100;

function parseBookFields(body) {
  const price = Number(body.price);
  if (body.price === undefined || body.price === '' || !Number.isFinite(price) || price < 0) {
    return { error: 'Giá phải là số không âm.' };
  }
  const title = String(body.title || '').trim();
  if (!title) return { error: 'Tên sách là bắt buộc.' };
  return { title, price };
}

// READ -> reader account (for both views; the writer connection is only used to write)
router.get('/', async (req, res) => {
  const books = await BookRead.find().sort({ code: 1 }).lean();
  console.log(`[READ] ${readUser} -> books.find (${books.length} docs)`);
  const { flash } = req.session;
  delete req.session.flash;
  res.render('books', { books, flash });
});

// WRITE -> writer account
router.post('/', requireWriter, validateCode, async (req, res) => {
  const fields = parseBookFields(req.body);
  if (fields.error) return res.status(400).render('error', { message: fields.error });
  const author = String(req.body.author || '').trim();
  if (!author) return res.status(400).render('error', { message: 'Tác giả là bắt buộc.' });

  const { title, price } = fields;
  const priceAfterVat = priceWithVat(price);
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
  console.log(`[WRITE] ${writeUser} -> books.create (${req.body.code})`);
  req.session.flash = `Đã thêm sách "${req.body.code}" (giá sau VAT ${priceAfterVat}) bằng tài khoản ghi ${writeUser}.`;
  res.redirect('/');
});

// WRITE -> writer account: rename and/or reprice; price after VAT is recomputed before saving
router.post('/books/:code', requireWriter, async (req, res) => {
  const fields = parseBookFields(req.body);
  if (fields.error) return res.status(400).render('error', { message: fields.error });

  const { code } = req.params;
  const { title, price } = fields;
  const priceAfterVat = priceWithVat(price);
  const result = await BookWrite.updateOne(
    { code },
    { $set: { title, price, vat: VAT, priceAfterVat } },
    { runValidators: true },
  );
  if (result.matchedCount === 0) {
    return res.status(404).render('error', { message: `Không tìm thấy sách có mã "${code}".` });
  }
  console.log(`[WRITE] ${writeUser} -> books.updateOne (${code})`);
  req.session.flash = `Đã cập nhật sách "${code}" (giá sau VAT ${priceAfterVat}) bằng tài khoản ghi ${writeUser}.`;
  res.redirect('/');
});

module.exports = router;
