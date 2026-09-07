from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import SESSION_COOKIE_NAME, settings
from app.core.exceptions import RateLimitError
from app.core.rate_limit import login_rate_limiter
from app.models.user import User
from app.schemas.auth import LoginRequest, UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _set_session_cookie(response: Response, session_id: str) -> None:
    """Session cookie: httpOnly + SameSite=Lax; Secure when ENVIRONMENT=prod."""
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,
        secure=settings.is_prod,
        samesite="lax",
        max_age=settings.session_expire_minutes * 60,
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.is_prod,
        samesite="lax",
    )


@router.post("/login", response_model=UserOut)
def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    if not login_rate_limiter.is_allowed(_client_ip(request)):
        raise RateLimitError("Too many login attempts. Try again later.")

    # AuthError is mapped to 401 by the global exception handler.
    user = auth_service.authenticate_user(db, body.email, body.password)
    auth_session = auth_service.create_session(db, user)
    _set_session_cookie(response, auth_session.id)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> Response:
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id:
        auth_service.delete_session(db, session_id)
    _clear_session_cookie(response)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
