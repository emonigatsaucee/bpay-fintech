#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit  # exit on error

# Install Python dependencies
pip install -r requirements.txt

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Collect static files
cd fintech_project
python manage.py collectstatic --no-input
python manage.py migrate