import { deletePostById } from "@/lib/storage";
import { isRequestAuthorizedFromNodeRequest } from "@/lib/auth";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  if (!isRequestAuthorizedFromNodeRequest(req)) {
    res.status(401).json({ status: "error", message: "Unauthorized" });
    return;
  }

  await deletePostById(String(req.query.postId || ""));
  res.status(200).json({ status: "ok" });
};

export default handler;
