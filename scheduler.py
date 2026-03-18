import logging
from pathlib import Path

from dotenv import load_dotenv

from app.services import update_posts_storage


BASE_DIR = Path(__file__).resolve().parent


load_dotenv(dotenv_path=BASE_DIR / ".env", override=False)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("vk_feed.scheduler")


def main() -> None:
    logger.info("Scheduler run started")
    new_count = update_posts_storage()
    logger.info("Scheduler run finished, added %s new posts", new_count)


if __name__ == "__main__":
    main()

