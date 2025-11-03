#!/usr/bin/env bash
# Start script for Render deployment

cd fintech_project
python manage.py migrate
gunicorn fintech_project.wsgi:application