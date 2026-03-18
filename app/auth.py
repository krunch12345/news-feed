import os
import secrets

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials


load_dotenv(override=False)


security = HTTPBasic()

USERNAME = os.getenv("BASIC_AUTH_USER") or ""
PASSWORD = os.getenv("BASIC_AUTH_PASS") or ""


def basic_auth(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    if not USERNAME and not PASSWORD:
        return ""

    is_username_ok = secrets.compare_digest(credentials.username, USERNAME)
    is_password_ok = secrets.compare_digest(credentials.password, PASSWORD)

    if not (is_username_ok and is_password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username

