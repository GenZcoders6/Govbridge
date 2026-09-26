"""
RBAC Dependencies — FastAPI-compatible
"""
import uuid
from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import User, UserRole
from app.security.jwt_handler import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        raw_user_id = payload.get("sub")
        if raw_user_id is None:
            raise credentials_exception
        user_id = uuid.UUID(str(raw_user_id))
    except (JWTError, ValueError):
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_roles(*roles: UserRole):
    """FastAPI dependency factory for role-based access control"""
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in roles]}",
            )
        return current_user
    return _check


# Convenience shortcuts
require_citizen = require_roles(UserRole.CITIZEN, UserRole.DEPARTMENT_OFFICER, UserRole.INTEGRATION_ADMIN, UserRole.AUDITOR)
require_officer = require_roles(UserRole.DEPARTMENT_OFFICER, UserRole.INTEGRATION_ADMIN)
require_admin = require_roles(UserRole.INTEGRATION_ADMIN)
require_auditor = require_roles(UserRole.AUDITOR, UserRole.INTEGRATION_ADMIN)
