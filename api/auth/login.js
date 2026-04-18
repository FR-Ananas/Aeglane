const bcrypt = require("bcryptjs");
const { supabase } = require("../../lib/supabase");
const { sign, setCookie } = require("../../lib/auth");

const COLOR_RE = /^\(([0-9A-Fa-f]{6})\)(.+)$/;
function parseUsername(raw) {
  const m = raw.trim().match(COLOR_RE);
  if (m) return { color: "#" + m[1].toUpperCase(), username: m[2].trim() };
  return { color: null, username: raw.trim() };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const { password } = req.body;
  const { username } = parseUsername(req.body.username || "");

  if (!username || !password)
    return res.status(400).json({ error: "Pseudo et mot de passe requis." });

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (!user) return res.status(401).json({ error: "Pseudo ou mot de passe incorrect." });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Pseudo ou mot de passe incorrect." });

  const token = sign({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    color: user.color,
    isAdmin: user.is_admin,
  });
  setCookie(res, token);
  res.json({ ok: true });
};
