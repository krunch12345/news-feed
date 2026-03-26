const handler = async (_req, res) => {
  res.setHeader("Set-Cookie", "session_user=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax");
  res.redirect(303, "/login");
};

export default handler;
