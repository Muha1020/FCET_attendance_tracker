from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    StudentListView,
    StudentMeView,
    LecturerMeView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),

    # Students
    path('students/', StudentListView.as_view(), name='student-list'),
    path('students/me/', StudentMeView.as_view(), name='student-me'),

    # Lecturers
    path('lecturers/me/', LecturerMeView.as_view(), name='lecturer-me'),
]
