from django.apps import AppConfig

class DjangoappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'djangoapp'

    def ready(self):
        # Delay import until Django is fully loaded
        from django.contrib.auth.models import User
        from django.db.utils import OperationalError, ProgrammingError

        try:
            # Auto-create default login user if missing
            if not User.objects.filter(username='admin').exists():
                User.objects.create_user(
                    username='admin',
                    password='admin123',
                    email='admin@example.com'
                )
                print("✨ Default user created: admin / admin123")
        except (OperationalError, ProgrammingError):
            # DB not ready yet: ignore silently
            pass
