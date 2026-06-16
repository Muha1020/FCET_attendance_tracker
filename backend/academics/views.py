from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS

from .models import AcademicSession, Semester
from .serializers import AcademicSessionSerializer, SemesterSerializer
from users.permissions import IsAdmin


class AcademicSessionViewSet(viewsets.ModelViewSet):
    """
    Anyone authenticated can list/retrieve sessions (needed for course-creation dropdowns).
    Write actions (create/update/delete) are admin-only.
    """

    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdmin()]


class SemesterViewSet(viewsets.ModelViewSet):
    """
    Anyone authenticated can list/retrieve semesters.
    Write actions (create/update/delete) are admin-only.
    """

    queryset = Semester.objects.select_related('academic_session').all()
    serializer_class = SemesterSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdmin()]
