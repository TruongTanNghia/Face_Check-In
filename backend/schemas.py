from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List

class UserBase(BaseModel):
    employee_id: str
    full_name: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    employee_id: Optional[str] = None

class UserResponse(UserBase):
    id: int
    face_registered: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    date: date
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    snapshot_path: Optional[str]
    user: Optional[UserResponse]

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_users: int
    checked_in_today: int
    checked_out_today: int

class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AttendanceLogResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime
    log_type: str
    snapshot_path: Optional[str]

    class Config:
        from_attributes = True
