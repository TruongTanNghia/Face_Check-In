# 🤖 Face Check-in System

A modern, high-tech Face Recognition Attendance System built with **Next.js**, **FastAPI**, and **Face_Recognition** library. This project provides a complete solution for managing employee attendance using biometric data with a Cyberpunk/Glassmorphism aesthetic.

## ✨ Key Features

- **Biometric Face Registration**: 
  - Guided 10-step webcam scanning with angle detection (Left, Right, Up, Down, Center).
  - High-tech visual feedback with flash effects and scanner animations.
  - Image upload support for manual registration.
- **Smart Attendance Tracking**:
  - Real-time face recognition and automatic check-in/out.
  - **Operational Modes**: Toggle between *Auto*, *Forced Check-in*, and *Forced Check-out*.
- **Admin Management**:
  - Dashboard with live statistics.
  - Comprehensive User Management (Register, Delete, View Activity).
  - **Detailed Activity Logs**: Chronological history for every user with timestamps and snapshots.
- **Modern UI/UX**: Cyberpunk-inspired dark theme with smooth transitions and glassmorphism components.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Face Recognition**: `face_recognition` (dlib based)
- **Image Processing**: OpenCV, NumPy

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Media**: HTML5 Webcam API
- **Icons**: Lucide React / SVG

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- C++ Compiler (for `dlib` installation)

### 1. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 Usage

1. **Login**: Access the admin panel using default credentials (if configured).
2. **Register**: Navigate to `Admin > User Management` to add a new employee.
3. **Scan Face**: Click "Register Face" for the new user. Follow the on-screen instructions to scan your face from various angles.
4. **Attendance**: Go to the homepage (Real-time Attendance) and position your face in the camera frame. The system will automatically log your event.
5. **View Logs**: Check individual activity history in the User Management section.

## 📁 Project Structure

```text
face_checkin/
├── backend/            # FastAPI Server
│   ├── data/           # Snapshots & DB storage
│   ├── main.py         # API Endpoints
│   ├── models.py       # DB Schemas
│   └── face_utils.py   # Recognition Logic
└── frontend/           # Next.js Application
    ├── app/           # Pages & Routes
    └── components/    # Reusable UI Blocks
```

## 🤝 Contributing
Feel free to fork this project and submit pull requests for any features or bug fixes.

---
*Created with ❤️ by Antigravity AI*
