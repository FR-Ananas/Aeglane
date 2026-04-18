const { supabase } = require("../../lib/supabase");
const { getUser } = require("../../lib/auth");

module.exports = async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Non authentifié" });

  if (req.method === "GET") {
    const { data: rooms, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at");
    if (error) return res.status(500).json({ error: "Erreur serveur." });
    return res.json(rooms);
  }

  if (req.method === "POST") {
    if (!user.isAdmin)
      return res.status(403).json({ error: "Accès réservé à l'administrateur." });

    let { name = "", description = "" } = req.body;
    name = name.trim().toLowerCase();

    if (!/^[a-z0-9-]{2,32}$/.test(name))
      return res.status(400).json({
        error: "Nom invalide (2–32 caractères, minuscules / chiffres / tirets).",
      });

    const { data: existing } = await supabase
      .from("rooms")
      .select("id")
      .eq("name", name)
      .maybeSingle();
    if (existing) return res.status(409).json({ error: "Ce salon existe déjà." });

    const { data: room, error } = await supabase
      .from("rooms")
      .insert({ name, description: description.trim() })
      .select()
      .single();

    if (error) return res.status(500).json({ error: "Erreur lors de la création du salon." });
    return res.json(room);
  }

  res.status(405).end();
};
