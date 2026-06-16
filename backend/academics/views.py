from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import AcademicSession, Semester
from .serializers import AcademicSessionSerializer, SemesterSerializer
from users.permissions import IsAdmin


class AcademicSessionViewSet(viewsets.ModelViewSet):
    """
    CRUD for academic sessions. Admin and superuser access only.
    """

    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class SemesterViewSet(viewsets.ModelViewSet):
    """
    CRUD for semesters. Admin and superuser access only.
    """

    queryset = Semester.objects.select_related('academic_session').all()
    serializer_class = SemesterSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
