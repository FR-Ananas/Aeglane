const jwt = require("jsonwebtoken");

const COOKIE = "aeglane_token";
const MAX_AGE = 7 * 24 * 60 * 60;

function sign(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function setCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE}; SameSite=Strict${secure}`
  );
}

function clearCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; HttpOnly; Path=/; Max-Age=0`);
}

function getUser(req) {
  const raw = req.headers.cookie || "";
  const match = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(COOKIE + "="));
  if (!match) return null;
  const token = match.slice(COOKIE.length + 1);
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { sign, setCookie, clearCookie, getUser };
