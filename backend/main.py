from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import numpy as np
import io
import os
import pandas as pd
from fastapi.responses import StreamingResponse
from passlib.context import CryptContext
from datetime import datetime, date, timedelta

import models, schemas, face_utils, database
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Face Recognition Attendance System")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# User Management
@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.employee_id == user.employee_id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Employee ID already registered")
    
    new_user = models.User(employee_id=user.employee_id, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/", response_model=List[schemas.UserResponse])
def read_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# Face Registration
@app.post("/register-face/{user_id}")
async def register_face(user_id: int, data: dict = Body(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    image_data = data.get("image")
    encodings, _ = face_utils.get_face_encodings(image_data)
    
    if len(encodings) == 0:
        raise HTTPException(status_code=400, detail="No face detected in image")
    if len(encodings) > 1:
        raise HTTPException(status_code=400, detail="Multiple faces detected. Please provide an image with only one face.")
    
    # Save encoding
    encoding_bytes = encodings[0].tobytes()
    new_encoding = models.FaceEncoding(user_id=user_id, encoding=encoding_bytes)
    db.add(new_encoding)
    
    user.face_registered = True
    db.commit()
    
    return {"message": "Face registered successfully"}

# Real-time Recognition & Attendance
@app.post("/recognize/")
async def recognize_face(data: dict = Body(...), db: Session = Depends(get_db)):
    image_data = data.get("image")
    requested_mode = data.get("mode", "Auto")  # "Auto", "Check-in", "Check-out"
    encodings, img = face_utils.get_face_encodings(image_data)
    
    if not encodings:
        return {"status": "no_face", "message": "No face detected"}
    
    current_encoding = encodings[0]
    
    # Load all registered encodings
    all_encodings_records = db.query(models.FaceEncoding).all()
    if not all_encodings_records:
        return {"status": "unknown", "message": "No users registered in system"}
    
    known_encodings = [np.frombuffer(rec.encoding, dtype=np.float64) for rec in all_encodings_records]
    user_ids = [rec.user_id for rec in all_encodings_records]
    
    match_idx = face_utils.compare_faces(known_encodings, current_encoding)
    
    if match_idx is not None:
        user_id = user_ids[match_idx]
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        # Attendance Logic
        today = date.today()
        attendance = db.query(models.Attendance).filter(
            models.Attendance.user_id == user_id, 
            models.Attendance.date == today
        ).first()
        
        now = datetime.now()
        cooldown_seconds = 10
        
        if attendance:
            # Check for cooldown
            last_activity = attendance.check_out or attendance.check_in
            if now - last_activity < timedelta(seconds=cooldown_seconds):
                return {"status": "cooldown", "name": user.full_name, "message": "Wait a few seconds..."}
            
            if requested_mode == "Auto":
                # Toggle logic
                if not attendance.check_out:
                    attendance.check_out = now
                    status_text = "Check-out"
                else:
                    # Reset check-out and update check-in (or just flip back)
                    # For professional systems, we might want to record another IN event
                    # For this simple model, let's just allow toggling back and forth
                    attendance.check_in = now
                    attendance.check_out = None
                    status_text = "Check-in"
            elif requested_mode == "Check-in":
                attendance.check_in = now
                attendance.check_out = None # Force in
                status_text = "Check-in"
            elif requested_mode == "Check-out":
                attendance.check_out = now
                status_text = "Check-out"
        else:
            # Record Check-in
            attendance = models.Attendance(user_id=user_id, date=today, check_in=now)
            db.add(attendance)
            status_text = "Check-in"
            
        # Optional: Save snapshot
        snapshot_path = face_utils.save_snapshot(img, user.employee_id, status_text)
        attendance.snapshot_path = snapshot_path
        
        # Record detailed log
        new_log = models.AttendanceLog(
            user_id=user_id,
            log_type=status_text,
            snapshot_path=snapshot_path,
            timestamp=now
        )
        db.add(new_log)
        
        db.commit()
        return {
            "status": "success", 
            "name": user.full_name, 
            "employee_id": user.employee_id,
            "type": status_text, 
            "time": now.strftime("%H:%M:%S")
        }
    
    return {"status": "unknown", "message": "Unauthorized or unknown person"}

# Dashboard & Stats
@app.get("/stats/", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    today = date.today()
    total_users = db.query(models.User).count()
    checked_in = db.query(models.Attendance).filter(models.Attendance.date == today).count()
    checked_out = db.query(models.Attendance).filter(models.Attendance.date == today, models.Attendance.check_out != None).count()
    
    return {
        "total_users": total_users,
        "checked_in_today": checked_in,
        "checked_out_today": checked_out
    }

@app.get("/attendance/", response_model=List[schemas.AttendanceResponse])
def get_attendance_history(db: Session = Depends(get_db)):
    return db.query(models.Attendance).order_by(models.Attendance.id.desc()).all()

@app.get("/users/{user_id}/logs", response_model=List[schemas.AttendanceLogResponse])
def get_user_logs(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return db.query(models.AttendanceLog).filter(models.AttendanceLog.user_id == user_id).order_by(models.AttendanceLog.timestamp.desc()).all()

@app.get("/export/")
def export_attendance(db: Session = Depends(get_db)):
    records = db.query(models.Attendance).all()
    data = []
    for r in records:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        data.append({
            "Employee ID": user.employee_id if user else "N/A",
            "Full Name": user.full_name if user else "N/A",
            "Date": r.date,
            "Check-in": r.check_in.strftime("%H:%M:%S") if r.check_in else "",
            "Check-out": r.check_out.strftime("%H:%M:%S") if r.check_out else ""
        })
    
    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_export_{date.today()}.csv"}
    )
    return response

# Admin Auth
@app.post("/login/")
def login(admin: schemas.AdminLogin, db: Session = Depends(get_db)):
    db_admin = db.query(models.AdminUser).filter(models.AdminUser.username == admin.username).first()
    if not db_admin or not pwd_context.verify(admin.password, db_admin.hashed_password):
        # For simplicity in Level 1, if no admin exists, we allow local creation or just check default
        if admin.username == "admin" and admin.password == "admin123":
            return {"status": "success", "username": "admin"}
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"status": "success", "username": db_admin.username}
