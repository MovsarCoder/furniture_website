up:
	docker-compose up -d --build

down:
	docker-compose down -v

build:
	git pull && docker-compose down && docker-compose up --build -d && docker-compose logs -f web

migrate:
	python manage.py makemigrations && python manage.py migrate