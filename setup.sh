#!/usr/bin/env bash
# NeuralEye — One-shot setup script
set -e

echo "======================================"
echo "  NeuralEye Setup"
echo "======================================"

# ── Backend ────────────────────────────────────────────────────────────────
echo ""
echo "[1/4] Setting up Python backend..."
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

echo "Backend setup complete."
deactivate
cd ..

# ── Frontend ───────────────────────────────────────────────────────────────
echo ""
echo "[2/4] Setting up React frontend..."
cd frontend

npm install

echo "Frontend setup complete."
cd ..

echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "To start the backend:"
echo "  cd backend && source venv/bin/activate && python manage.py runserver"
echo ""
echo "To start the frontend (in a separate terminal):"
echo "  cd frontend && npm start"
echo ""
echo "The app will be available at http://localhost:3000"
echo "API runs at http://localhost:8000"
