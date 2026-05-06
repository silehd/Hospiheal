import os
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.conf import settings

class Command(BaseCommand):
    help = 'Run migrations, collect static, and create a superuser if none exists (production only).'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting setup...'))

        # 1. Run migrations
        self.stdout.write('Running migrations...')
        call_command('migrate', interactive=False)

        # 2. Collect static files
        self.stdout.write('Collecting static files...')
        call_command('collectstatic', interactive=False)

        # 3. Create superuser only in production (DEBUG=False) and if credentials are provided
        if not settings.DEBUG:
            User = get_user_model()
            email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
            password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
            username = os.environ.get('DJANGO_SUPERUSER_USERNAME')

            if email and password:
                if not User.objects.filter(email=email).exists():
                    self.stdout.write(f'Creating superuser with email {email}...')
                    User.objects.create_superuser(
                        email=email,
                        password=password,
                        username=username or email.split('@')[0],
                        first_name='Admin',
                        last_name='User',
                        role='admin',
                    )
                    self.stdout.write(self.style.SUCCESS('Superuser created.'))
                else:
                    self.stdout.write('Superuser already exists.')
            else:
                self.stdout.write(self.style.WARNING(
                    'Environment variables DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD not set. Skipping superuser creation.'
                ))
        else:
            self.stdout.write(self.style.WARNING('DEBUG=True – skipping automatic superuser creation.'))

        self.stdout.write(self.style.SUCCESS('Setup completed.'))