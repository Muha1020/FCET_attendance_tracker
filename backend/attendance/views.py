from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from courses.models import ClassEnrollment
from users.permissions import IsLecturerOrClassRep, IsStudent
from .models import AttendanceSession, AttendanceRecord
from .serializers import (
    AttendanceSessionSerializer,
    PinResponseSerializer,
    MarkAttendanceSerializer,
    AttendanceRecordSerializer,
    StudentHistoryRecordSerializer,
)


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    """
    Manage attendance sessions.
    - Lecturers and class reps can open/close sessions and retrieve PINs.
    - Students submit the PIN to mark their attendance.
    """

    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'lecturer':
            return AttendanceSession.objects.filter(
                course__lecturer=user.lecturer_profile
            ).select_related('course', 'created_by')

        if user.role == 'student':
            rep_course_ids = ClassEnrollment.objects.filter(
                student=user.student_profile, is_class_rep=True
            ).values_list('course_id', flat=True)
            return AttendanceSession.objects.filter(
                course_id__in=rep_course_ids
            ).select_related('course', 'created_by')

        return AttendanceSession.objects.none()

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsLecturerOrClassRep()]
        if self.action in ('mark', 'retrieve'):
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        """Students can fetch session info to see course/date before submitting a PIN."""
        if request.user.role == 'student':
            instance = get_object_or_404(AttendanceSession, pk=kwargs['pk'])
            return Response(self.get_serializer(instance).data)
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Validate ownership before saving and attach created_by."""
        user = self.request.user
        course = serializer.validated_data['course']

        if user.role == 'lecturer':
            if course.lecturer.user != user:
                raise PermissionDenied('You do not own this course.')
        elif user.role == 'student':
            if not ClassEnrollment.objects.filter(
                student=user.student_profile,
                course=course,
                is_class_rep=True,
            ).exists():
                raise PermissionDenied('You are not the class rep for this course.')

        serializer.save(created_by=user)

    def _assert_lecturer_or_rep(self, session):
        """Raise PermissionDenied if the caller has no authority over this session."""
        user = self.request.user
        if user.role == 'lecturer':
            if session.course.lecturer.user != user:
                raise PermissionDenied('You do not own this course.')
        elif user.role == 'student':
            if not ClassEnrollment.objects.filter(
                student=user.student_profile,
                course=session.course,
                is_class_rep=True,
            ).exists():
                raise PermissionDenied('You are not the class rep for this course.')
        else:
            raise PermissionDenied('Access denied.')

    @extend_schema(responses={200: PinResponseSerializer})
    @action(detail=True, methods=['get'])
    def pin(self, request, pk=None):
        """
        Return the current PIN. Automatically regenerates it when the PIN has expired.
        Lecturer and class rep access only.
        """
        session = self.get_object()
        self._assert_lecturer_or_rep(session)
        session.refresh_pin_if_expired()
        return Response(PinResponseSerializer({'pin': session.pin, 'expires_at': session.pin_expiry}).data)

    @extend_schema(request=MarkAttendanceSerializer, responses={200: {'type': 'object'}})
    @action(detail=True, methods=['post'])
    def mark(self, request, pk=None):
        """
        Student submits the 6-digit PIN to mark attendance.
        Every failed attempt is logged with a reason for the audit trail.
        """
        # Bypass the lecturer/class-rep-scoped queryset so any student can mark.
        session = get_object_or_404(AttendanceSession, pk=pk)
        student = request.user.student_profile

        # Prevent a second successful record.
        already_succeeded = AttendanceRecord.objects.filter(
            attendance_session=session,
            student=student,
            status='success',
        ).exists()
        if already_succeeded:
            return Response(
                {'detail': 'You have already marked your attendance for this session.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = MarkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submitted_pin = serializer.validated_data['pin']

        def _log_failure(reason: str):
            AttendanceRecord.objects.create(
                attendance_session=session,
                student=student,
                status='failed',
                failure_reason=reason,
            )

        if not session.is_active:
            _log_failure('Session is closed')
            return Response(
                {'detail': 'This attendance session is closed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if session.is_pin_expired:
            _log_failure('PIN has expired')
            return Response(
                {'detail': 'The PIN has expired. Ask the lecturer or class rep for a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if submitted_pin != session.pin:
            _log_failure('Wrong PIN')
            return Response(
                {'detail': 'Incorrect PIN.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        AttendanceRecord.objects.create(
            attendance_session=session,
            student=student,
            status='success',
        )
        return Response({'detail': 'Attendance marked successfully.'})

    @extend_schema(responses={200: AttendanceRecordSerializer(many=True)})
    @action(detail=True, methods=['get'])
    def records(self, request, pk=None):
        """
        Full attendance sheet including failed attempts.
        Lecturer and class rep access only.
        """
        session = self.get_object()
        self._assert_lecturer_or_rep(session)
        records = AttendanceRecord.objects.filter(
            attendance_session=session
        ).select_related('student__user')
        return Response(AttendanceRecordSerializer(records, many=True).data)

    @extend_schema(responses={200: {'type': 'object'}})
    @action(detail=True, methods=['patch'])
    def close(self, request, pk=None):
        """
        Close the attendance session so no further submissions are accepted.
        Lecturer and class rep access only.
        """
        session = self.get_object()
        self._assert_lecturer_or_rep(session)
        if not session.is_active:
            return Response(
                {'detail': 'Session is already closed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        session.is_active = False
        session.save(update_fields=['is_active'])
        return Response({'detail': 'Attendance session closed.'})


class StudentAttendanceHistoryView(generics.ListAPIView):
    """
    GET /attendance/my-records/
    Returns all attendance records for the authenticated student, newest first.
    """
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = StudentHistoryRecordSerializer

    def get_queryset(self):
        return (
            AttendanceRecord.objects.filter(student=self.request.user.student_profile)
            .select_related('attendance_session__course')
            .order_by('-timestamp')
        )
