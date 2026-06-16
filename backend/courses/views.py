from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from academics.models import AcademicSession, Semester
from users.models import StudentProfile
from users.serializers import StudentProfileSerializer
from users.permissions import IsLecturer
from .models import Course, ClassEnrollment
from .serializers import CourseSerializer, CourseCreateSerializer, AssignRepSerializer


class CourseViewSet(viewsets.ModelViewSet):
    """
    Lecturers can create and manage their own courses.
    Students see courses that match their level and department.
    """

    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'lecturer':
            return Course.objects.filter(lecturer=user.lecturer_profile).select_related(
                'lecturer__user', 'academic_session', 'semester'
            )
        if user.role == 'student':
            student = user.student_profile
            return Course.objects.filter(
                target_levels__contains=[student.level],
                target_departments__contains=[student.department],
            ).select_related('lecturer__user', 'academic_session', 'semester')
        return Course.objects.none()

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsLecturer()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = CourseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        start, end = map(int, data['session_name'].split('/'))
        academic_session, _ = AcademicSession.objects.get_or_create(
            session_name=data['session_name'],
            defaults={'start_year': start, 'end_year': end},
        )
        semester, _ = Semester.objects.get_or_create(
            academic_session=academic_session,
            semester_type=data['semester_type'],
        )
        course = Course.objects.create(
            course_code=data['course_code'],
            course_name=data['course_name'],
            lecturer=request.user.lecturer_profile,
            academic_session=academic_session,
            semester=semester,
            target_levels=data['target_levels'],
            target_departments=data['target_departments'],
        )
        return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)

    def _assert_owns_course(self, course):
        """Raise PermissionDenied if the requesting lecturer does not own the course."""
        if self.request.user.role != 'lecturer':
            raise PermissionDenied('Only the course lecturer can perform this action.')
        if course.lecturer.user != self.request.user:
            raise PermissionDenied('You do not own this course.')

    @extend_schema(responses={200: StudentProfileSerializer(many=True)})
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """
        List students whose level and department match this course's target criteria.
        Lecturer access only.
        """
        course = self.get_object()
        self._assert_owns_course(course)

        students = StudentProfile.objects.filter(
            level__in=course.target_levels,
            department__in=course.target_departments,
        ).select_related('user')

        serializer = StudentProfileSerializer(students, many=True)
        return Response(serializer.data)

    @extend_schema(request=AssignRepSerializer, responses={200: {'type': 'object'}})
    @action(detail=True, methods=['post'], url_path='assign-rep')
    def assign_rep(self, request, pk=None):
        """
        Assign a class representative for this course.
        The student must match the course's target level/department, or already be enrolled.
        Lecturer access only.
        """
        course = self.get_object()
        self._assert_owns_course(course)

        serializer = AssignRepSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.validated_data['student_id']

        # Verify eligibility: student matches target criteria OR is already enrolled.
        matches_criteria = (
            student.level in course.target_levels
            and student.department in course.target_departments
        )
        is_enrolled = ClassEnrollment.objects.filter(
            student=student, course=course
        ).exists()

        if not matches_criteria and not is_enrolled:
            raise ValidationError(
                'Student does not match the course target level/department '
                'and is not enrolled in this course.'
            )

        # Clear any existing class rep for this course, then set the new one.
        ClassEnrollment.objects.filter(course=course, is_class_rep=True).update(
            is_class_rep=False
        )
        enrollment, _ = ClassEnrollment.objects.get_or_create(
            student=student, course=course
        )
        enrollment.is_class_rep = True
        enrollment.save(update_fields=['is_class_rep'])

        return Response(
            {'detail': f'{student.user.full_name} assigned as class rep for {course.course_code}.'}
        )
