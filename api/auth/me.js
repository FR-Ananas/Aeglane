const { getUser } = require("../../lib/auth");

module.exports = (req, res) => {
  if (req.method !== "GET") return res.status(405).end();
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Non authentifié" });
  res.json({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    color: user.color,
    isAdmin: user.isAdmin,
  });
};
