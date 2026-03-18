import logging
import os
import re
import time
from typing import Dict, List, Optional, Union

import requests
from dotenv import load_dotenv


logger = logging.getLogger("vk_feed.vk_client")


load_dotenv(override=False)


VK_TOKEN = os.getenv("VK_TOKEN", "")
VK_API_VERSION = os.getenv("VK_API_VERSION", "5.131")
VK_REQUEST_DELAY = float(os.getenv("VK_REQUEST_DELAY", "0.5"))


class VkApiError(Exception):
    pass


def _call_vk_method(method: str, params: Dict) -> Dict:
    url = f"https://api.vk.com/method/{method}"
    base_params = {
        "access_token": VK_TOKEN,
        "v": VK_API_VERSION,
    }
    merged_params = {**base_params, **params}

    for attempt in range(2):
        response = requests.get(url, params=merged_params, timeout=10)
        data = response.json()

        if "error" in data:
            error = data["error"]
            error_code = error.get("error_code")
            message = error.get("error_msg")
            logger.warning("VK API error %s: %s", error_code, message)

            if error_code == 6 and attempt == 0:
                time.sleep(2.0)
                continue

            raise VkApiError(f"VK API error {error_code}: {message}")

        return data

    raise VkApiError("VK API failed after retries")


def _extract_group_name_from_response(response: Dict, owner_id: int) -> Optional[str]:
    groups = response.get("response", {}).get("groups") or []
    for group in groups:
        if -int(group.get("id")) == owner_id:
            return group.get("name")
    return None


_VK_LINK_PATTERN = re.compile(r"\[(.+?)\|(.+?)\]")


def clean_vk_links(text: str) -> str:
    if not text:
        return ""
    return _VK_LINK_PATTERN.sub(r"\2", text)


def _map_attachments(raw_attachments: List[Dict]) -> List[Dict]:
    mapped: List[Dict] = []
    for att in raw_attachments or []:
        att_type = att.get("type")
        if not att_type:
            continue

        if att_type == "photo":
            photo = att.get("photo", {}) or {}
            sizes = photo.get("sizes") or []
            best_url = None
            if sizes:
                best = max(
                    sizes,
                    key=lambda s: (s.get("width") or 0) * (s.get("height") or 0),
                )
                best_url = best.get("url")
            mapped.append({"type": "photo", "url": best_url} if best_url else {"type": "photo"})
        elif att_type == "audio":
            audio = att.get("audio", {}) or {}
            artist = audio.get("artist") or ""
            title = audio.get("title") or ""
            full_title = f"{artist} - {title}".strip(" -")
            if full_title:
                mapped.append({"type": "audio", "title": full_title})
            else:
                mapped.append({"type": "audio"})
        elif att_type == "video":
            video = att.get("video", {}) or {}
            title = video.get("title") or ""
            if title:
                mapped.append({"type": "video", "title": title})
            else:
                mapped.append({"type": "video"})
        else:
            mapped.append({"type": att_type})

    return mapped


def fetch_posts_for_groups(groups: List[Union[str, Dict[str, str]]], count: int = 5) -> List[dict]:
    all_new_posts: List[dict] = []

    for group in groups:
        if isinstance(group, dict):
            group_id_str = str(group.get("id", "")).strip()
            group_name_from_config = str(group.get("name", "")).strip()
        else:
            group_id_str = str(group).strip()
            group_name_from_config = ""

        if not group_id_str:
            logger.warning("Empty group id value in config: %r", group)
            continue

        try:
            owner_id = int(group_id_str)
        except ValueError:
            logger.warning("Invalid group id value: %s", group_id_str)
            continue

        try:
            data = _call_vk_method(
                "wall.get",
                {
                    "owner_id": owner_id,
                    "count": count,
                    "extended": 1,
                },
            )
        except VkApiError as exc:
            logger.error("Failed to fetch posts for group %s: %s", group_id_str, exc)
            time.sleep(VK_REQUEST_DELAY)
            continue

        response = data.get("response", {})
        items = response.get("items", [])
        group_name_api = _extract_group_name_from_response(data, owner_id)
        group_name = group_name_from_config or group_name_api or str(group_id_str)

        for item in items:
            if "copy_history" in item:
                continue

            post_id = f'{item.get("owner_id")}_{item.get("id")}'
            attachments_raw = item.get("attachments", []) or []
            attachments = _map_attachments(attachments_raw)

            text_raw = item.get("text") or ""
            text_clean = clean_vk_links(text_raw)

            all_new_posts.append(
                {
                    "id": post_id,
                    "group": group_name,
                    "date": item.get("date"),
                    "text": text_clean,
                    "url": f'https://vk.com/wall{post_id}',
                    "attachments": attachments,
                }
            )

        time.sleep(VK_REQUEST_DELAY)

    return all_new_posts

