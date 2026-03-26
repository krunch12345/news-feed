import fs from "node:fs/promises";
import path from "node:path";
import { appConfig } from "@/lib/config";

const handler = async (req, res) => {
  const name = String(req.query.name || "");
  if (!name || name.includes("/")) {
    res.status(404).end("Not found");
    return;
  }

  try {
    const imagePath = path.join(appConfig.postsImagesDir, name);
    const content = await fs.readFile(imagePath);
    res.setHeader("content-type", "image/jpeg");
    res.status(200).send(content);
  } catch {
    res.status(404).end("Not found");
  }
};

export default handler;
