const { supabase } = require("../../../lib/supabase");
const { getUser } = require("../../../lib/auth");

module.exports = async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Non authentifié" });
  if (req.method !== "POST") return res.status(405).end();

  const { name } = req.query;
  const { content, type = "text" } = req.body;

  if (!content || typeof content !== "string")
    return res.status(400).json({ error: "Contenu invalide." });
  if (type === "text" && content.trim().length === 0)
    return res.status(400).json({ error: "Message vide." });
  if (type === "text" && content.length > 250)
    return res.status(400).json({ error: "Message trop long." });
  if (type === "image" && content.length > 4 * 1024 * 1024)
    return res.status(400).json({ error: "Image trop grande." });

  const { data: room } = await supabase
    .from("rooms")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (!room) return res.status(404).json({ error: "Salon introuvable." });

  const trimmed = type === "text" ? content.trim() : content;
  const { data: message, error } = await supabase
    .from("messages")
    .insert({ room_id: room.id, user_id: user.id, content: trimmed, type })
    .select("id, content, type, created_at")
    .single();

  if (error) return res.status(500).json({ error: "Erreur lors de l'envoi du message." });

  res.json({
    id: message.id,
    content: message.content,
    type: message.type,
    created_at: message.created_at,
    user_id: user.id,
    username: user.username,
    avatar: user.avatar,
    color: user.color,
    is_admin: user.isAdmin ? 1 : 0,
  });
};
