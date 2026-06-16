from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'message': 'Attentra API is up and running.'})

urlpatterns = [
    path('', health_check, name='health-check'),
    path('admin/', admin.site.urls),

    path('api/', include('users.urls')),
    path('api/', include('academics.urls')),
    path('api/', include('courses.urls')),
    path('api/', include('attendance.urls')),

    # API schema & docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
