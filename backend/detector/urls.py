from django.urls import path
from . import views

urlpatterns = [
    path('detect/', views.detect, name='detect'),
    path('history/', views.history, name='history'),
    path('history/<int:pk>/', views.delete_record, name='delete-record'),
    path('health/', views.health, name='health'),
]
