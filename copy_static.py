#!/usr/bin/env python3
import os
import shutil
from pathlib import Path

# Paths
frontend_build = Path('frontend/build/static')
django_static = Path('fintech_project/staticfiles')

# Create staticfiles directory if it doesn't exist
django_static.mkdir(exist_ok=True)

# Copy React build static files
if frontend_build.exists():
    # Remove existing static files
    if (django_static / 'css').exists():
        shutil.rmtree(django_static / 'css')
    if (django_static / 'js').exists():
        shutil.rmtree(django_static / 'js')
    if (django_static / 'media').exists():
        shutil.rmtree(django_static / 'media')
    
    # Copy new files
    shutil.copytree(frontend_build, django_static, dirs_exist_ok=True)
    print("✅ Static files copied successfully")
else:
    print("❌ Frontend build directory not found. Run 'npm run build' first.")