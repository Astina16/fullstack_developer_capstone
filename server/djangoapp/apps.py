from django.apps import AppConfig
from django.contrib.auth.models import User
from django.db.utils import OperationalError, ProgrammingError

class DjangoappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'djangoapp'

    def ready(self):
        # AUTO-CREATE DEFAULT USER FOR RENDER DEPLOYMENT
        try:
            if not User.objects.filter(username="admin").exists():
                User.objects.create_user(
                    username="admin",
                    password="admin123",
                    email="admin@example.com"
                )
                print("✨ Auto-created default user: admin / admin123")
        except (OperationalError, ProgrammingError):
            # Happens during first migrate; safe to ignore
            pass
