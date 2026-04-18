const { supabase } = require("../../../lib/supabase");
const { getUser } = require("../../../lib/auth");

module.exports = async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Non authentifié" });
  if (req.method !== "GET") return res.status(405).end();

  const { name } = req.query;
  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (!room) return res.status(404).json({ error: "Salon introuvable." });

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, type, created_at, users(id, username, avatar, color, is_admin)")
    .eq("room_id", room.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const flat = (messages || []).reverse().map((m) => ({
    id: m.id,
    content: m.content,
    type: m.type,
    created_at: m.created_at,
    user_id: m.users.id,
    username: m.users.username,
    avatar: m.users.avatar,
    color: m.users.color,
    is_admin: m.users.is_admin ? 1 : 0,
  }));

  res.json(flat);
};
