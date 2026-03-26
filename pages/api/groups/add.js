import { loadGroups, saveGroups } from "@/lib/storage";
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

  const groupId = String(req.body?.group_id || "").trim();
  const groupName = String(req.body?.group_name || "").trim();
  if (!groupId) {
    res.status(400).json({ status: "error", message: "ID сообщества не может быть пустым" });
    return;
  }

  const groups = await loadGroups();
  if (groups.some((group) => String(group.id) === groupId)) {
    res.status(400).json({ status: "error", message: "Сообщество с таким ID уже есть в списке" });
    return;
  }

  groups.push({ id: groupId, name: groupName || groupId });
  await saveGroups(groups);
  res.status(200).json({ status: "ok" });
};

export default handler;
