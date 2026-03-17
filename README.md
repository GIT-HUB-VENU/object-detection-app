# NeuralEye — Object Detection App

Real-time object detection using YOLOv8 + Django REST + React.

## Stack
- **Backend**: Django 4.2 + Django REST Framework + YOLOv8 (ultralytics) + OpenCV
- **Frontend**: React 18 + Tailwind CSS + Axios

## Quick Start

### Option A — Automated setup
```bash
chmod +x setup.sh
./setup.sh
```

### Option B — Manual setup

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend (separate terminal)
```bash
cd frontend
npm install
npm start
```

The app runs at **http://localhost:3000**, API at **http://localhost:8000**.

## Notes
- YOLOv8 nano (`yolov8n.pt`) is downloaded automatically on first run (~6 MB).
- Detection history is stored in SQLite (`backend/db.sqlite3`).
- Uploaded images and results are stored in `backend/media/`.

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/detect/` | Run object detection on an image |
| GET | `/api/history/` | Paginated detection history |
| DELETE | `/api/history/<id>/` | Delete a detection record |
| GET | `/api/health/` | Health check |
