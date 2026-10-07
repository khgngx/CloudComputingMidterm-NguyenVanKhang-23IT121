const { CODE_PREFIX } = require('../config/student');

// "<3 digits>-<sequence number>", e.g. "121-001".
const CODE_FORMAT = /^(\d{3})-\d+$/;

// Shared by the add form (body) and the search box (query string).
function parseCode(raw) {
  const code = String(raw || '').trim();
  const match = CODE_FORMAT.exec(code);
  if (!match) {
    return {
      error: `Mã sản phẩm phải có dạng "${CODE_PREFIX}-<số thứ tự>", ví dụ "${CODE_PREFIX}-001". Yêu cầu bị từ chối.`,
    };
  }
  if (match[1] !== CODE_PREFIX) {
    return {
      error: `Thư viện chỉ có đầu mã sách ${CODE_PREFIX}! Bạn đã nhập "${match[1]}". Yêu cầu bị từ chối.`,
    };
  }
  return { code };
}

module.exports = (req, res, next) => {
  const parsed = parseCode(req.body.code);
  if (parsed.error) return res.status(400).render('error', { message: parsed.error });
  req.body.code = parsed.code;
  next();
};
module.exports.parseCode = parseCode;
