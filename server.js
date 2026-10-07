require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const sessionMw = require('./middleware/session');
const booksRouter = require('./routes/books');
const statusRouter = require('./routes/status');
const accountRouter = require('./routes/account');
const { readUser, writeUser } = require('./config/db');
const { STUDENT_ID, STUDENT_NAME, CODE_PREFIX, VAT } = require('./config/student');

const app = express();
app.set('trust proxy', 1); // required behind Render's proxy for secure cookies

app.engine('hbs', engine({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Before the session middleware so uptime pings don't create session documents.
app.get('/healthz', (req, res) => res.send('ok'));

app.use(express.urlencoded({ extended: false }));
app.use(sessionMw);

app.use((req, res, next) => {
  req.session.views = (req.session.views || 0) + 1;
  res.locals.views = req.session.views;
  res.locals.studentName = STUDENT_NAME;
  res.locals.studentId = STUDENT_ID;
  res.locals.vat = VAT;
  res.locals.codePrefix = CODE_PREFIX;
  res.locals.isWriter = req.session.account === 'writer'; // default: least privilege
  res.locals.readUser = readUser;
  res.locals.writeUser = writeUser;
  next();
});

app.use('/status', statusRouter);
app.use('/account', accountRouter);
app.use('/', booksRouter);

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).render('error', { message: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
