const { clearCookie } = require("../../lib/auth");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  clearCookie(res);
  res.json({ ok: true });
};
