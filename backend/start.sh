#!/bin/bash
python manage.py migrate --noinput
python manage.py loaddata superuser.json --ignore  # ignores if already present
python manage.py collectstatic --noinput
gunicorn hospital_management.wsgi:application#!/bin/bash
python manage.py migrate --noinput
python manage.py loaddata superuser.json --ignore  # ignores if already present
python manage.py collectstatic --noinput
gunicorn hospital_management.wsgi:application