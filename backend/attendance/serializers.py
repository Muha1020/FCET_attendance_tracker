from rest_framework import serializers

from .models import AttendanceSession, AttendanceRecord


class AttendanceSessionSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.course_code', read_only=True)
    course_name = serializers.CharField(source='course.course_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = AttendanceSession
        fields = [
            'id',
            'course',
            'course_code',
            'course_name',
            'date',
            'is_active',
            'created_by',
            'created_by_name',
        ]
        read_only_fields = ['created_by', 'is_active']


class PinResponseSerializer(serializers.Serializer):
    """Shape of the response from GET .../pin/"""

    pin = serializers.CharField()
    expires_at = serializers.DateTimeField()


class MarkAttendanceSerializer(serializers.Serializer):
    """Payload for POST .../mark/"""

    pin = serializers.CharField(max_length=6, min_length=6)


class AttendanceRecordSerializer(serializers.ModelSerializer):
    matric_number = serializers.CharField(source='student.matric_number', read_only=True)
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'attendance_session',
            'student',
            'matric_number',
            'student_name',
            'timestamp',
            'status',
            'failure_reason',
        ]
        read_only_fields = fields


class StudentHistoryRecordSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='attendance_session.course.course_code', read_only=True)
    course_name = serializers.CharField(source='attendance_session.course.course_name', read_only=True)
    session_date = serializers.DateField(source='attendance_session.date', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'course_code', 'course_name', 'session_date', 'timestamp', 'status', 'failure_reason']
        read_only_fields = fields
