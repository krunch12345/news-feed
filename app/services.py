import logging
import os
import time
from pathlib import Path
from typing import List

import requests
from dotenv import load_dotenv

from app.storage import IMAGES_DIR, load_groups, load_posts, save_posts
from app.vk_client import fetch_posts_for_groups


logger = logging.getLogger("vk_feed.services")


load_dotenv(override=False)


MAX_POSTS = int(os.getenv("MAX_POSTS", "500"))
MAX_IMAGES_PER_POST = 10


def _download_post_images(post: dict) -> List[str]:
    images: List[str] = []
    attachments = post.get("attachments") or []
    post_id = str(post.get("id"))

    for index, att in enumerate(attachments):
        if len(images) >= MAX_IMAGES_PER_POST:
            break

        if not isinstance(att, dict):
            continue

        if att.get("type") != "photo":
            continue

        url = att.get("url")
        if not url:
            continue

        filename = f"{post_id.replace('-', '_')}_{index}.jpg"
        local_path = IMAGES_DIR / filename

        if local_path.exists():
            images.append(filename)
            continue

        try:
            resp = requests.get(url, timeout=15)
            if resp.status_code == 200:
                IMAGES_DIR.mkdir(parents=True, exist_ok=True)
                with local_path.open("wb") as f:
                    f.write(resp.content)
                images.append(filename)
        except Exception as exc:
            logger.error("Failed to download image for post %s: %s", post_id, exc)

    return images


def update_posts_storage() -> int:
    group_objects = load_groups()
    if not group_objects:
        logger.info("No groups configured, skipping fetch")
        return 0

    existing_posts: List[dict] = load_posts()
    existing_ids = {str(post.get("id")) for post in existing_posts}

    fetched_posts = fetch_posts_for_groups(group_objects)

    now_ts = int(time.time())
    threshold = now_ts - 4 * 3600
    recent_fetched = [
        post
        for post in fetched_posts
        if isinstance(post.get("date"), (int, float)) and post["date"] >= threshold
    ]

    new_posts: List[dict] = []
    for post in recent_fetched:
        if str(post.get("id")) in existing_ids:
            continue
        post_images = _download_post_images(post)
        if post_images:
            post["postImages"] = post_images
        new_posts.append(post)

    if not new_posts:
        logger.info("No new posts fetched")
        return 0

    combined_posts = new_posts + existing_posts
    if MAX_POSTS > 0:
        combined_posts = combined_posts[:MAX_POSTS]

    save_posts(combined_posts)

    logger.info("Added %s new posts, total %s", len(new_posts), len(combined_posts))
    return len(new_posts)

