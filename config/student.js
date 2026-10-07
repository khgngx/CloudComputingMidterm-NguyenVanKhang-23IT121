// Single source of truth for the per-student rules (code prefix, VAT).
const STUDENT_ID = process.env.STUDENT_ID || '23IT121';
const STUDENT_NAME = process.env.STUDENT_NAME || 'Nguyễn Văn Khang';

const CODE_PREFIX = STUDENT_ID.slice(-3);               // last 3 digits -> "121"
const VAT = Number(STUDENT_ID.slice(-1)) + 3;           // (last digit + 3)%

module.exports = { STUDENT_ID, STUDENT_NAME, CODE_PREFIX, VAT };
