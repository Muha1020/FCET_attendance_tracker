

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import StudentProfile, LecturerProfile
from .serializers import (
    RegistrationSerializer,
    LoginSerializer,
    StudentProfileSerializer,
    LecturerProfileSerializer,
)
from .permissions import IsStudent, IsLecturer, IsAdminOrLecturer


class RegisterView(APIView):
    """
    Register a new student or lecturer.
    Role is auto-determined from the identifier format — no role field needed.
    """

    permission_classes = [AllowAny]
    serializer_class = RegistrationSerializer

    @extend_schema(request=RegistrationSerializer)
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Registration successful.', 'role': user.role},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Login with a matric number (student) or staff ID (lecturer) and password.
    Returns JWT access and refresh tokens with the role embedded in the payload.
    """

    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(request=LoginSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['_user']

        refresh = RefreshToken.for_user(user)
        # Embed role and name so the frontend can render immediately without an extra request.
        refresh['role'] = user.role
        refresh['full_name'] = user.full_name

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'full_name': user.full_name,
        })


class StudentListView(generics.ListAPIView):
    """List all students. Filterable by level and department. Admin and lecturer access only."""

    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminOrLecturer]

    @extend_schema(
        parameters=[
            OpenApiParameter('level', int, description='Filter by level (100–500)'),
            OpenApiParameter('department', str, description='Filter by department name'),
        ]
    )
    def get_queryset(self):
        qs = StudentProfile.objects.select_related('user').all()
        level = self.request.query_params.get('level')
        department = self.request.query_params.get('department')
        if level:
            qs = qs.filter(level=level)
        if department:
            qs = qs.filter(department=department)
        return qs


class StudentMeView(generics.RetrieveAPIView):
    """Return the authenticated student's own profile."""

    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_object(self):
        return self.request.user.student_profile


class LecturerMeView(generics.RetrieveAPIView):
    """Return the authenticated lecturer's own profile."""

    serializer_class = LecturerProfileSerializer
    permission_classes = [IsAuthenticated, IsLecturer]

    def get_object(self):
        return self.request.user.lecturer_profile
