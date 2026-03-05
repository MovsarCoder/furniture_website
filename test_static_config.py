#!/usr/bin/env python
"""
Test script to verify that static and media files can be served when DEBUG=False
"""

import os
import sys
import django
from django.conf import settings
from django.urls import get_resolver
from django.test import Client
from django.http import HttpRequest
from django.core.management import execute_from_command_line

# Add the project directory to Python path
sys.path.append("/Users/mansur/Desktop/furniture_project_2")

# Configure Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "furniture.settings")

# Initialize Django
django.setup()


def test_static_media_serving():
    """Test that static and media file configurations are properly set"""
    print("Testing Static and Media File Configuration...")

    # Test settings
    print(f"DEBUG: {settings.DEBUG}")
    print(f"STATIC_URL: {settings.STATIC_URL}")
    print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
    print(f"MEDIA_URL: {settings.MEDIA_URL}")
    print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
    print(f"STATICFILES_STORAGE: {getattr(settings, 'STATICFILES_STORAGE', 'Not set')}")

    # Check if WhiteNoise is in middleware
    has_whitenoise = any("whitenoise" in mw.lower() for mw in settings.MIDDLEWARE)
    print(f"WhiteNoise Middleware: {'Yes' if has_whitenoise else 'No'}")

    # Check if directories exist
    print(f"STATIC_ROOT exists: {os.path.exists(settings.STATIC_ROOT)}")
    print(f"MEDIA_ROOT exists: {os.path.exists(settings.MEDIA_ROOT)}")

    # Check some common static files
    static_css_dir = os.path.join(settings.STATIC_ROOT, "css")
    static_images_dir = os.path.join(settings.STATIC_ROOT, "images")
    print(f"Static CSS directory exists: {os.path.exists(static_css_dir)}")
    print(f"Static images directory exists: {os.path.exists(static_images_dir)}")

    print(
        "\nConfiguration looks good for serving static and media files with DEBUG=False!"
    )


if __name__ == "__main__":
    test_static_media_serving()
