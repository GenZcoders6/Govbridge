"""
Departments Router
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import Department, User
from app.schemas.schemas import DepartmentRead, DepartmentCreate
from app.security import get_current_user, require_admin

router = APIRouter()


@router.get("", response_model=List[DepartmentRead], include_in_schema=False)
@router.get("/", response_model=List[DepartmentRead])
async def list_departments(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Department).where(Department.is_active == True))
    return result.scalars().all()


@router.get("/{dept_id}", response_model=DepartmentRead)
async def get_department(
    dept_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@router.post("", response_model=DepartmentRead, status_code=201, include_in_schema=False)
@router.post("/", response_model=DepartmentRead, status_code=201)
async def create_department(
    body: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    dept = Department(**body.model_dump())
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept
