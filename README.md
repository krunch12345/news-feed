## VK news feed (FastAPI)

Minimal VK communities wall aggregator built with FastAPI + Jinja2 + a bit of JS.

### Features

- Fetches posts from configured VK communities using VK API.
- Stores posts in a JSON file (`data/posts.json`) with a simple schema:
  - `id`: `"ownerId_postId"` (for example `"-123_456"`).
  - `group`: community name from VK.
  - `date`: unix timestamp.
  - `text`: post text.
  - `url`: full wall URL.
  - `attachments`: array of attachment types (`"photo"`, `"video"`, etc.).
- Simple HTML UI (Bootstrap cards):
  - copy full post info to clipboard (time, group, text, URL, attachments),
  - delete post.
- Separate scheduler script for running from cron or systemd timer.

### Project structure

- `app/main.py` — FastAPI app entry point (HTML, delete endpoint).
- `app/storage.py` — JSON storage helpers (posts, groups, schedule) with safe atomic writes.
- `app/vk_client.py` — VK API client with delay between requests and simple retry on rate-limit.
- `app/services.py` — service layer, updates posts storage and trims feed to `MAX_POSTS`.
- `scheduler.py` — standalone script for cron/systemd, triggers posts update once per run.
- `templates/index.html` — Jinja2 template with Bootstrap cards.
- `static/app.js` — frontend logic for copy/delete buttons.
- `data/posts.json` — posts database (JSON).
- `data/groups.json` — list of group IDs as strings, for example:

```json
[
  "-123",
  "-456"
]
```

- `data/schedule.json` — schedule placeholder (times like `"02:00"`), for future UI.
- `.env.example` — example configuration.

### Configuration

Copy `.env.example` to `.env` and set values:

```bash
cp .env.example .env
```

Required:

- `VK_TOKEN` — your VK API token.

Optional (with defaults):

- `VK_API_VERSION` — default `5.131`.
- `VK_REQUEST_DELAY` — delay in seconds between wall.get requests (default `0.5`).
- `MAX_POSTS` — maximum number of posts to keep in `posts.json` (default `500`).
- `DATA_DIR` — path to data directory, default `./data`.
- `PAGE_SIZE` — number of posts per page in UI (default `20`).

Basic auth (optional, but recommended on server):

- `BASIC_AUTH_USER`, `BASIC_AUTH_PASS` — if both are set and non-empty, HTTP Basic auth is enabled for all endpoints. If left empty, auth is disabled.

### Local setup

```bash
python -m venv .venv
source .venv/bin/activate  # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Fill `.env` with your VK token and other options, then add some group IDs to `data/groups.json`:

```json
[
  "-123",
  "-456"
]
```

Run scheduler once to fetch posts:

```bash
python scheduler.py
```

Then start the app:

```bash
uvicorn app.main:app --reload
```

Open in browser:

- `http://127.0.0.1:8000/`

### Running on server with nginx

Basic idea:

1. Install and configure Python environment, copy project files and `.env` (do not commit `.env`).
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Use `uvicorn` or `gunicorn` with Uvicorn workers:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

or:

```bash
gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 127.0.0.1:8000
```

4. Configure `systemd` unit (example sketch):

```ini
[Unit]
Description=VK feed FastAPI app
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/project
EnvironmentFile=/path/to/project/.env
ExecStart=/path/to/project/.venv/bin/gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 127.0.0.1:8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

5. nginx as reverse-proxy (sketch):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/project/static/;
    }
}
```

### Scheduler from cron

Example cron entry (run every 4 hours at 02:00, 06:00, 10:00, 14:00, 18:00, 22:00):

```cron
0 2,6,10,14,18,22 * * * cd /path/to/project && /path/to/project/.venv/bin/python scheduler.py >> /var/log/vk_feed_scheduler.log 2>&1
```

`data/schedule.json` currently acts as configuration for future UI and documentation of schedule.

