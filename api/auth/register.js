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

  const { password, avatar } = req.body;
  const { username, color } = parseUsername(req.body.username || "");

  if (!username || !password)
    return res.status(400).json({ error: "Pseudo et mot de passe requis." });
  if (username.length < 2 || username.length > 24)
    return res.status(400).json({ error: "Le pseudo doit faire entre 2 et 24 caractères." });
  if (password.length < 4)
    return res.status(400).json({ error: "Mot de passe trop court (min 4 caractères)." });

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .ilike("username", username)
    .maybeSingle();
  if (existing) return res.status(409).json({ error: "Ce pseudo est déjà pris." });

  const hash = await bcrypt.hash(password, 10);
  const { data: user, error } = await supabase
    .from("users")
    .insert({ username, password: hash, avatar: avatar || null, color: color || null })
    .select("id, username, avatar, color, is_admin")
    .single();

  if (error) return res.status(500).json({ error: "Erreur lors de la création du compte." });

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
