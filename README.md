## VK news feed (Next.js)

Single-project VK communities wall aggregator built with Next.js, MUI, and Node.js server logic.

### Stack

- Next.js (Pages Router) + MUI.
- Server-side API routes in `pages/api`.
- Domain logic and storage in `src/lib`.
- Node scheduler script in `scripts/scheduler.mjs`.
- Yarn as the package manager.

### Features

- Fetches posts from configured VK communities via VK API.
- Stores data in JSON files:
  - `data/posts.json`
  - `data/groups.json`
  - `data/schedule.json`
- Renders posts, schedule, and groups tabs in one UI.
- Supports login/logout, post deletion, group CRUD, and schedule CRUD.
- Serves downloaded post images from `postsImages/`.

### Project structure

- `pages/` — UI pages and API endpoints.
- `src/components/` — React UI components.
- `src/lib/` — config, auth, storage, VK client, services.
- `scripts/scheduler.mjs` — scheduler process for periodic updates.
- `data/` — runtime JSON data.
- `postsImages/` — runtime post images.
- `.env.example` — environment variables template.

### Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Main environment variables:

- `VK_TOKEN` — VK API token.
- `VK_API_VERSION` — default `5.131`.
- `VK_REQUEST_DELAY` — request delay in seconds (default `0.5`).
- `MAX_POSTS` — max amount of stored posts (default `500`).
- `DATA_DIR` — data directory path (default `./data`).
- `POSTS_IMAGES_DIR` — images directory path (default `./postsImages`).
- `PAGE_SIZE` — posts per page (default `20`).
- `AUTH_USER`, `AUTH_PASS` — UI login credentials.

### Local setup

```bash
yarn install
cp .env.example .env
```

Run development server:

```bash
yarn dev
```

Open in browser: `http://localhost:3111`

Run production build:

```bash
yarn build
yarn start
```

Production server also runs on port `3111`.

Run scheduler once:

```bash
yarn scheduler
```

### Notes

- Legacy Python implementation has been removed from this repository.
- Runtime data is intentionally preserved in `data/` and `postsImages/`.
- Vite is not required for Next.js in this project because Next already provides its own build and dev pipeline.

