from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date, LargeBinary
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    face_registered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    encodings = relationship("FaceEncoding", back_populates="user", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    attendance_logs = relationship("AttendanceLog", back_populates="user", cascade="all, delete-orphan")

class FaceEncoding(Base):
    __tablename__ = "face_encodings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    encoding = Column(LargeBinary)  # Store numpy array as bytes

    user = relationship("User", back_populates="encodings")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, default=datetime.utcnow().date)
    check_in = Column(DateTime)
    check_out = Column(DateTime, nullable=True)
    snapshot_path = Column(String, nullable=True)

    user = relationship("User", back_populates="attendances")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    log_type = Column(String)  # "Check-in" or "Check-out"
    snapshot_path = Column(String, nullable=True)

    user = relationship("User", back_populates="attendance_logs")

class AdminUser(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
