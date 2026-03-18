import json
import logging
import os
from pathlib import Path
from typing import Dict, List

from dotenv import load_dotenv


logger = logging.getLogger("vk_feed.storage")


BASE_DIR = Path(__file__).resolve().parent.parent


load_dotenv(dotenv_path=BASE_DIR / ".env", override=False)


DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)

POSTS_FILE = DATA_DIR / "posts.json"
GROUPS_FILE = DATA_DIR / "groups.json"
SCHEDULE_FILE = DATA_DIR / "schedule.json"
IMAGES_DIR = Path(os.getenv("POSTS_IMAGES_DIR", BASE_DIR / "postsImages"))


def _safe_load_json(path: Path, default):
    if not path.exists():
        return default
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.error("Failed to load JSON from %s: %s", path, exc)
        return default


def _safe_save_json(path: Path, data) -> None:
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    try:
        with tmp_path.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, path)
    except Exception as exc:
        logger.error("Failed to save JSON to %s: %s", path, exc)
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError:
                logger.error("Failed to remove temp file %s", tmp_path)


def load_posts() -> List[dict]:
    data = _safe_load_json(POSTS_FILE, default=[])
    return data if isinstance(data, list) else []


def save_posts(posts: List[dict]) -> None:
    _safe_save_json(POSTS_FILE, posts)


def delete_post_by_id(post_id: str) -> bool:
    posts = load_posts()
    original_len = len(posts)

    posts_to_keep = []
    images_to_delete = []

    for post in posts:
        if str(post.get("id")) == post_id:
            for image_name in post.get("postImages", []) or []:
                if not image_name:
                    continue
                image_path = IMAGES_DIR / str(image_name)
                images_to_delete.append(image_path)
        else:
            posts_to_keep.append(post)

    if len(posts_to_keep) == original_len:
        return False

    for image_path in images_to_delete:
        try:
            if image_path.exists():
                image_path.unlink()
        except Exception as exc:
            logger.error("Failed to delete image file %s: %s", image_path, exc)

    save_posts(posts_to_keep)
    return True


def load_groups() -> List[Dict[str, str]]:
    data = _safe_load_json(GROUPS_FILE, default=[])
    if not isinstance(data, list):
        return []

    groups: List[Dict[str, str]] = []
    for item in data:
        if isinstance(item, dict):
            group_id = str(item.get("id", "")).strip()
            name = str(item.get("name", "")).strip()
            if group_id:
                groups.append({"id": group_id, "name": name or group_id})
        else:
            group_id = str(item).strip()
            if group_id:
                groups.append({"id": group_id, "name": group_id})

    return groups


def save_groups(groups: List[Dict[str, str]]) -> None:
    normalized: List[Dict[str, str]] = []
    for item in groups:
        if not isinstance(item, dict):
            group_id = str(item).strip()
            if group_id:
                normalized.append({"id": group_id, "name": group_id})
            continue

        group_id = str(item.get("id", "")).strip()
        name = str(item.get("name", "")).strip()
        if group_id:
            normalized.append({"id": group_id, "name": name or group_id})

    _safe_save_json(GROUPS_FILE, normalized)


def load_schedule() -> List[str]:
    data = _safe_load_json(SCHEDULE_FILE, default=[])
    if isinstance(data, list):
        return [str(t) for t in data]
    return []


def save_schedule(times: List[str]) -> None:
    _safe_save_json(SCHEDULE_FILE, times)

