#!/bin/bash

# Script to run the furniture project locally with proper configuration

echo "Starting furniture project with Nginx..."

# Make sure static files directory exists
mkdir -p staticfiles media

# Collect static files
echo "Collecting static files..."
docker-compose run --rm web python manage.py collectstatic --noinput

# Run the full setup with docker-compose
echo "Starting services..."
docker-compose up -d --build

echo "Services started successfully!"
echo ""
echo "Your application is now available at:"
echo "  http://localhost"
echo "  http://bmass.at (add to /etc/hosts if needed)"
echo "  http://www.bmass.at (add to /etc/hosts if needed)"
echo "  http://bmass.fr (add to /etc/hosts if needed)"
echo "  http://www.bmass.fr (add to /etc/hosts if needed)"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"