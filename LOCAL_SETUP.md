# Local Development Setup with Nginx

This document explains how to set up and run the furniture project locally with Nginx for proper domain support.

## Prerequisites

- Docker and Docker Compose installed
- Make sure you have ports 80 and 8000 available on your machine

## Configuration

The project includes:

1. **Development Nginx configuration** (`nginx/nginx.dev.conf`):
   - Serves the application on port 80
   - Handles static and media files
   - Proxies requests to the Django application
   - Works without SSL for local development

2. **Updated Docker Compose** (`docker-compose.yml`):
   - Uses the development Nginx configuration
   - Maps port 80 (not 443) for local development
   - Properly mounts static and media files

3. **Updated Django settings** (`furniture/settings.py`):
   - DEBUG mode enabled by default for local development
   - Proper domain configuration for local testing

## Running the Application

### Method 1: Using the provided script

```bash
./run_local.sh
```

### Method 2: Manual commands

1. Make sure static files directory exists:
```bash
mkdir -p staticfiles media
```

2. Build and start the services:
```bash
docker-compose up -d --build
```

3. Collect static files (only needed once or when new static files are added):
```bash
docker-compose run --rm web python manage.py collectstatic --noinput
```

## Accessing the Application

After starting the services, your application will be available at:

- http://localhost
- http://127.0.0.1
- http://bmass.at (may require hosts file modification)
- http://www.bmass.at (may require hosts file modification)
- http://bmass.fr (may require hosts file modification)
- http://www.bmass.fr (may require hosts file modification)

### Modifying your hosts file (if needed)

To access the domain names directly, add these lines to your `/etc/hosts` file:

```
127.0.0.1 bmass.at
127.0.0.1 www.bmass.at
127.0.0.1 bmass.fr
127.0.0.1 www.bmass.fr
```

On macOS/Linux, use:
```bash
sudo nano /etc/hosts
```

## Useful Commands

- View logs: `docker-compose logs -f`
- Stop services: `docker-compose down`
- Restart services: `docker-compose restart`
- Execute commands in web container: `docker-compose exec web bash`

## Production Configuration

For production deployment, we've also included:

- Production Nginx configuration (`nginx/nginx.prod.conf`)
- Production Docker Compose (`docker-compose.prod.yml`)

These are configured with SSL support and appropriate security settings.

## Troubleshooting

### Common Issues

1. **Port already in use**: Make sure ports 80 and 8000 are not being used by other applications
2. **Permission errors**: Make sure you have proper permissions to run Docker
3. **Static files not loading**: Run `docker-compose run --rm web python manage.py collectstatic --noinput`

### Checking Status

Check if all services are running:
```bash
docker-compose ps
```

View detailed logs:
```bash
docker-compose logs web
docker-compose logs nginx
docker-compose logs db
```