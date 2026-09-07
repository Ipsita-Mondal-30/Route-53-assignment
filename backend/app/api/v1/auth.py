from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import SESSION_COOKIE_NAME, settings
from app.models.user import User
from app.schemas.auth import LoginRequest, UserOut
from app.services import auth_service
from app.services.auth_service import AuthError

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_session_cookie(response: Response, session_id: str) -> None:
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
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    try:
        user = auth_service.authenticate_user(db, body.email, body.password)
    except AuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    auth_session = auth_service.create_session(db, user)
    _set_session_cookie(response, auth_session.id)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> None:
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id:
        auth_service.delete_session(db, session_id)
    _clear_session_cookie(response)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
