from django.contrib import admin
from django.urls import path, include 
from djangoapp import views 
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),

    # --- ALL APPLICATION PATHS DEFINED HERE ---
    path('', views.get_dealers, name='index'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),

    # Static pages defined here:
    path('login/', views.login_request, name='login'),
    path('register/', views.registration_request, name='register'),
    path('logout/', views.logout_request, name='logout'),
    # Use 'include' to pass everything else to the app's URLs file
    # This line tells Django to check djangoapp/urls.py for any other path.
    #path('', include('djangoapp.urls')), # <--- ENSURE THIS IS PRESENT AND CORRECT
    path('sentiment/', views.sentiment_analysis, name='sentiment'),

    path('dealer/<int:dealer_id>/', views.get_dealer_details, name='dealer_details'), 
    path('add_review/<int:dealer_id>/', views.add_review, name='add_review'),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 
# ... and the STATIC_URL setting at the bottom