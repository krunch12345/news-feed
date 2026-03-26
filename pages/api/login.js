import { checkLoginCredentials } from "@/lib/auth";
import { appConfig } from "@/lib/config";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const username = String(req.body?.username || "");
  const password = String(req.body?.password || "");

  if (!checkLoginCredentials({ username, password })) {
    res.redirect(303, "/login?error=1");
    return;
  }

  res.setHeader("Set-Cookie", `session_user=${encodeURIComponent(appConfig.authUser)}; Path=/; HttpOnly; SameSite=Lax`);
  res.redirect(303, "/");
};

export default handler;
