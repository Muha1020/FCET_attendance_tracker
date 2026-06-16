from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AttendanceSessionViewSet, StudentAttendanceHistoryView

router = DefaultRouter()
router.register('attendance/sessions', AttendanceSessionViewSet, basename='attendancesession')

urlpatterns = [
    path('', include(router.urls)),
    path('attendance/my-records/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
]
