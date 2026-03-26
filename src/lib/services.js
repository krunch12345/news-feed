import fs from "node:fs/promises";
import path from "node:path";
import { appConfig } from "@/lib/config";
import { fetchPostsForGroups } from "@/lib/vk-client";
import { loadGroups, loadPosts, savePosts, loadSchedule } from "@/lib/storage";

const maxImagesPerPost = 10;

const downloadPostImages = async (post) => {
  const images = [];
  const attachments = post?.attachments || [];
  const postId = String(post?.id || "");

  for (let index = 0; index < attachments.length; index += 1) {
    if (images.length >= maxImagesPerPost) {
      break;
    }

    const attachment = attachments[index];
    if (attachment?.type !== "photo" || !attachment?.url) {
      continue;
    }

    const filename = `${postId.replaceAll("-", "_")}_${index}.jpg`;
    const localPath = path.join(appConfig.postsImagesDir, filename);

    try {
      await fs.access(localPath);
      images.push(filename);
      continue;
    } catch {}

    try {
      const response = await fetch(attachment.url);
      if (!response.ok) {
        continue;
      }
      const arrayBuffer = await response.arrayBuffer();
      await fs.mkdir(appConfig.postsImagesDir, { recursive: true });
      await fs.writeFile(localPath, Buffer.from(arrayBuffer));
      images.push(filename);
    } catch {}
  }

  return images;
};

export const updatePostsStorage = async () => {
  const groups = await loadGroups();
  if (!groups.length) {
    return 0;
  }

  const existingPosts = await loadPosts();
  const existingIds = new Set(existingPosts.map((post) => String(post?.id)));
  const fetchedPosts = await fetchPostsForGroups(groups);
  const threshold = Math.floor(Date.now() / 1000) - (4 * 3600);
  const recentFetched = fetchedPosts.filter((post) => Number(post?.date) >= threshold);

  const newPosts = [];
  for (const post of recentFetched) {
    if (existingIds.has(String(post.id))) {
      continue;
    }
    const postImages = await downloadPostImages(post);
    if (postImages.length) {
      post.postImages = postImages;
    }
    newPosts.push(post);
  }

  if (!newPosts.length) {
    return 0;
  }

  const combined = [...newPosts, ...existingPosts].slice(0, appConfig.maxPosts);
  await savePosts(combined);
  return newPosts.length;
};

export const runScheduledUpdate = async () => {
  const times = await loadSchedule();
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const nowTime = `${hh}:${mm}`;
  if (!times.includes(nowTime)) {
    return 0;
  }
  return updatePostsStorage();
};
