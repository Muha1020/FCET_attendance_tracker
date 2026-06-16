from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AcademicSessionViewSet, SemesterViewSet

router = DefaultRouter()
router.register('sessions', AcademicSessionViewSet, basename='academicsession')
router.register('semesters', SemesterViewSet, basename='semester')

urlpatterns = [
    path('', include(router.urls)),
]
