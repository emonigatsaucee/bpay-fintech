#!/bin/bash
set -e

echo "🔨 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "📦 Copying static files..."
python copy_static.py

echo "🗃️ Collecting Django static files..."
cd fintech_project
python manage.py collectstatic --noinput

echo "✅ Build complete!"