// Enforces the account switch on the server: hiding the forms in the view is not enough.
module.exports = (req, res, next) => {
  if (res.locals.isWriter) return next();
  res.status(403).render('error', {
    message: 'Tài khoản Reader chỉ có quyền xem. Hãy chuyển sang tài khoản Writer để thêm hoặc sửa sách.',
  });
};
