const { supabase } = require("../../lib/supabase");
const { getUser } = require("../../lib/auth");

module.exports = async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Non authentifié" });
  if (!user.isAdmin)
    return res.status(403).json({ error: "Accès réservé à l'administrateur." });
  if (req.method !== "DELETE") return res.status(405).end();

  const { name } = req.query;
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  if (!room) return res.status(404).json({ error: "Salon introuvable." });
  if (room.protected)
    return res.status(403).json({ error: "Ce salon est protégé et ne peut pas être supprimé." });

  await supabase.from("messages").delete().eq("room_id", room.id);
  await supabase.from("rooms").delete().eq("id", room.id);

  res.json({ ok: true });
};
