const { CODE_PREFIX } = require('../config/student');

module.exports = (req, res, next) => {
  const code = String(req.body.code || '').trim();
  if (!code.startsWith(CODE_PREFIX)) {
    return res.status(400).render('error', {
      message: `Mã sản phẩm phải bắt đầu bằng "${CODE_PREFIX}". Yêu cầu bị từ chối.`,
    });
  }
  req.body.code = code;
  next();
};
