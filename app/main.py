import logging
import os
from datetime import datetime
from math import ceil
from pathlib import Path
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Form, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from zoneinfo import ZoneInfo

from app.auth import basic_auth
from app.storage import load_groups, load_posts, load_schedule


BASE_DIR = Path(__file__).resolve().parent.parent


load_dotenv(dotenv_path=BASE_DIR / ".env", override=False)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("vk_feed")


templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


app = FastAPI()


static_dir = BASE_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

images_dir = Path(os.getenv("POSTS_IMAGES_DIR", BASE_DIR / "postsImages"))
if images_dir.exists():
    app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")


PAGE_SIZE = int(os.getenv("PAGE_SIZE", "20"))
AUTH_USER = os.getenv("AUTH_USER") or ""
AUTH_PASS = os.getenv("AUTH_PASS") or ""


def _is_frontend_authenticated(request: Request) -> bool:
    if not AUTH_USER and not AUTH_PASS:
        return True
    session_user = request.cookies.get("session_user")
    return bool(session_user and session_user == AUTH_USER)


def _build_pagination(page: int, total_pages: int) -> List[Dict]:
    items: List[Dict] = []

    if total_pages <= 1:
        return items

    items.append(
        {"type": "first", "page": 1, "disabled": page <= 1},
    )
    items.append(
        {"type": "prev", "page": max(1, page - 1), "disabled": page <= 1},
    )

    window = 2
    start = max(1, page - window)
    end = min(total_pages, page + window)

    if start > 1:
        items.append({"type": "number", "page": 1, "active": page == 1})
        if start > 2:
            items.append({"type": "dots"})

    for p in range(start, end + 1):
        items.append({"type": "number", "page": p, "active": p == page})

    if end < total_pages:
        if end < total_pages - 1:
            items.append({"type": "dots"})
        items.append(
            {"type": "number", "page": total_pages, "active": page == total_pages},
        )

    items.append(
        {"type": "next", "page": min(total_pages, page + 1), "disabled": page >= total_pages},
    )
    items.append(
        {"type": "last", "page": total_pages, "disabled": page >= total_pages},
    )

    return items


def _prepare_post_view(post: Dict) -> Dict:
    result = dict(post)

    date_value = result.get("date")
    if isinstance(date_value, (int, float)):
        dt = datetime.fromtimestamp(date_value, tz=ZoneInfo("Europe/Moscow"))
        result["date_human"] = dt.strftime("%d.%m.%Y %H:%M")
    else:
        result["date_human"] = ""

    attachments = result.get("attachments") or []
    photos_count = 0
    audio_titles: List[str] = []
    video_titles: List[str] = []

    for att in attachments:
        if isinstance(att, str):
            if att == "photo":
                photos_count += 1
            continue

        att_type = att.get("type")
        if att_type == "photo":
            photos_count += 1
        elif att_type == "audio":
            title = att.get("title")
            if title:
                audio_titles.append(title)
        elif att_type == "video":
            title = att.get("title")
            if title:
                video_titles.append(title)

    parts: List[str] = []
    if photos_count:
        parts.append(f"Изображения ({photos_count})")
    if audio_titles:
        parts.append(f"Аудио: {', '.join(audio_titles)}")
    if video_titles:
        parts.append(f"Видео: {', '.join(video_titles)}")

    result["attachments_view"] = "; ".join(parts)
    return result


@app.get("/", response_class=HTMLResponse)
async def index(
    request: Request,
    page: int = Query(1, ge=1),
    tab: str = Query("posts"),
    group_query: str | None = Query(None, alias="group_query"),
    user: str = Depends(basic_auth),
) -> HTMLResponse:
    if not _is_frontend_authenticated(request):
        return templates.TemplateResponse(
            "login.html",
            {
                "request": request,
                "error": None,
            },
        )

    active_tab = tab if tab in {"posts", "schedule", "groups"} else "posts"

    posts_context: List[dict] = []
    pagination_items: List[Dict] = []
    total_posts = 0
    total_schedule = 0
    total_groups = 0
    schedule_times: List[str] = []
    groups: List[Dict] = []
    total_pages = 1

    if active_tab == "posts":
        posts: List[dict] = load_posts()
        posts_sorted = sorted(posts, key=lambda p: p.get("date", 0))

        total_posts = len(posts_sorted)
        total_pages = max(1, ceil(total_posts / PAGE_SIZE)) if PAGE_SIZE > 0 else 1

        if page > total_pages:
            page = total_pages

        start_index = (page - 1) * PAGE_SIZE
        end_index = start_index + PAGE_SIZE if PAGE_SIZE > 0 else total_posts
        page_raw = posts_sorted[start_index:end_index]
        posts_context = [_prepare_post_view(post) for post in page_raw]

        pagination_items = _build_pagination(page, total_pages)

    elif active_tab == "schedule":
        schedule_times = sorted(load_schedule())
        total_schedule = len(schedule_times)

    elif active_tab == "groups":
        all_groups = load_groups()
        if group_query:
            q = group_query.strip().lower()
            groups = [
                g
                for g in all_groups
                if str(g.get("name", "")).lower().find(q) != -1
                or str(g.get("id", "")).lower().find(q) != -1
            ]
        else:
            groups = all_groups

        total_groups = len(groups)

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "active_tab": active_tab,
            "posts": posts_context,
            "page": page,
            "total_pages": total_pages,
            "total_posts": total_posts,
            "total_schedule": total_schedule,
            "total_groups": total_groups,
            "pagination_items": pagination_items,
            "schedule_times": schedule_times,
            "groups": groups,
            "group_query": group_query or "",
        },
    )


@app.post("/login", response_class=HTMLResponse)
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
) -> HTMLResponse:
    if AUTH_USER and AUTH_PASS and username == AUTH_USER and password == AUTH_PASS:
        response = RedirectResponse(url="/", status_code=303)
        response.set_cookie("session_user", AUTH_USER, httponly=True)
        return response

    return templates.TemplateResponse(
        "login.html",
        {
            "request": request,
            "error": "Неверный логин или пароль",
        },
    )


@app.get("/logout")
async def logout(request: Request) -> RedirectResponse:
    response = RedirectResponse(url="/", status_code=303)
    response.delete_cookie("session_user")
    return response


@app.post("/schedule/add")
async def schedule_add(
    request: Request,
    time_value: str = Form(..., alias="time"),
    user: str = Depends(basic_auth),
) -> RedirectResponse:
    from app.storage import load_schedule, save_schedule

    times = load_schedule()
    if time_value not in times:
        times.append(time_value)
        times = sorted(times)
        save_schedule(times)
    return RedirectResponse(url="/?tab=schedule", status_code=303)


@app.post("/schedule/delete")
async def schedule_delete(
    request: Request,
    time_value: str = Form(..., alias="time"),
    user: str = Depends(basic_auth),
) -> RedirectResponse:
    from app.storage import load_schedule, save_schedule

    times = load_schedule()
    times_filtered = [t for t in times if t != time_value]
    if len(times_filtered) != len(times):
        save_schedule(times_filtered)
    return RedirectResponse(url="/?tab=schedule", status_code=303)


@app.post("/groups/delete")
async def groups_delete(
    request: Request,
    group_id: str = Form(..., alias="group_id"),
    user: str = Depends(basic_auth),
) -> RedirectResponse:
    from app.storage import load_groups, save_groups

    all_groups = load_groups()
    groups_filtered = [g for g in all_groups if str(g.get("id")) != str(group_id)]
    if len(groups_filtered) != len(all_groups):
        save_groups(groups_filtered)

    return RedirectResponse(url="/?tab=groups", status_code=303)


@app.post("/groups/add")
async def groups_add(
    request: Request,
    group_id: str = Form(..., alias="group_id"),
    group_name: str = Form(..., alias="group_name"),
    user: str = Depends(basic_auth),
) -> JSONResponse:
    from app.storage import load_groups, save_groups

    group_id_clean = group_id.strip()
    group_name_clean = group_name.strip()

    if not group_id_clean:
        return JSONResponse({"status": "error", "message": "ID сообщества не может быть пустым"}, status_code=400)

    all_groups = load_groups()
    for g in all_groups:
        if str(g.get("id")) == group_id_clean:
            return JSONResponse(
                {"status": "error", "message": "Сообщество с таким ID уже есть в списке"},
                status_code=400,
            )

    new_group = {"id": group_id_clean, "name": group_name_clean or group_id_clean}
    all_groups.append(new_group)
    save_groups(all_groups)

    return JSONResponse({"status": "ok"})


@app.post("/delete/{post_id}")
async def delete_post(
    post_id: str,
    user: str = Depends(basic_auth),
) -> JSONResponse:
    from app.storage import delete_post_by_id

    deleted = delete_post_by_id(post_id)
    if not deleted:
        logger.info("Post %s not found for deletion", post_id)
    return JSONResponse({"status": "ok"})

