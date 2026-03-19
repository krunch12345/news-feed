import logging
import os
from datetime import datetime
from pathlib import Path
import fcntl
from zoneinfo import ZoneInfo

from dotenv import load_dotenv

from app.storage import load_schedule
from app.services import update_posts_storage


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
LOCK_FILE = DATA_DIR / "scheduler.lock"
STATE_FILE = DATA_DIR / "scheduler_last_run.txt"
MOSCOW_TZ = ZoneInfo("Europe/Moscow")


load_dotenv(dotenv_path=BASE_DIR / ".env", override=False)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("vk_feed.scheduler")


def _read_last_run() -> str:
    if not STATE_FILE.exists():
        return ""
    try:
        return STATE_FILE.read_text(encoding="utf-8").strip()
    except OSError as exc:
        logger.error("Failed to read scheduler state file %s: %s", STATE_FILE, exc)
        return ""


def _write_last_run(value: str) -> None:
    tmp_state_file = STATE_FILE.with_suffix(".tmp")
    try:
        tmp_state_file.write_text(value, encoding="utf-8")
        os.replace(tmp_state_file, STATE_FILE)
    except OSError as exc:
        logger.error("Failed to write scheduler state file %s: %s", STATE_FILE, exc)
        if tmp_state_file.exists():
            try:
                tmp_state_file.unlink()
            except OSError:
                logger.error("Failed to remove temp state file %s", tmp_state_file)
        raise


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    now = datetime.now(MOSCOW_TZ)
    now_hhmm = now.strftime("%H:%M")
    now_minute_key = now.strftime("%Y-%m-%d %H:%M")

    schedule_times = {time.strip() for time in load_schedule() if str(time).strip()}
    if now_hhmm not in schedule_times:
        logger.info("Skipping run: %s is not in schedule", now_hhmm)
        return

    if _read_last_run() == now_minute_key:
        logger.info("Skipping run: already executed at %s", now_minute_key)
        return

    with LOCK_FILE.open("w", encoding="utf-8") as lock_file:
        try:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            logger.info("Skipping run: another scheduler process is active")
            return

        if _read_last_run() == now_minute_key:
            logger.info("Skipping run: already executed at %s", now_minute_key)
            return

        logger.info("Scheduler run started for %s", now_minute_key)
        new_count = update_posts_storage()
        _write_last_run(now_minute_key)
        logger.info("Scheduler run finished, added %s new posts", new_count)


if __name__ == "__main__":
    main()

