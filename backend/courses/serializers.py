import re

from rest_framework import serializers

from users.models import StudentProfile
from .models import Course, ClassEnrollment, LEVEL_CHOICES, DEPARTMENT_CHOICES


class CourseCreateSerializer(serializers.Serializer):
    """Write-only serializer for course creation via session_name + semester_type strings."""

    course_code = serializers.CharField(max_length=20)
    course_name = serializers.CharField(max_length=200)
    session_name = serializers.CharField(
        max_length=9,
        help_text='Academic session in YYYY/YYYY format, e.g. "2026/2027".',
    )
    semester_type = serializers.ChoiceField(choices=['Harmattan', 'Rain'])
    target_levels = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    target_departments = serializers.ListField(child=serializers.CharField(), min_length=1)

    def validate_session_name(self, value):
        if not re.match(r'^\d{4}/\d{4}$', value):
            raise serializers.ValidationError('Use YYYY/YYYY format, e.g. "2026/2027".')
        start, end = map(int, value.split('/'))
        if end != start + 1:
            raise serializers.ValidationError('End year must be exactly one after start year.')
        return value

    def validate_target_levels(self, value):
        invalid = [v for v in value if v not in LEVEL_CHOICES]
        if invalid:
            raise serializers.ValidationError(f'Invalid levels: {invalid}. Choices are {LEVEL_CHOICES}.')
        return value

    def validate_target_departments(self, value):
        invalid = [v for v in value if v not in DEPARTMENT_CHOICES]
        if invalid:
            raise serializers.ValidationError(f'Invalid departments: {invalid}. Choices are {DEPARTMENT_CHOICES}.')
        return value


class CourseSerializer(serializers.ModelSerializer):
    lecturer_name = serializers.CharField(source='lecturer.user.full_name', read_only=True)
    session_name = serializers.CharField(source='academic_session.session_name', read_only=True)
    semester_type = serializers.CharField(source='semester.semester_type', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id',
            'course_code',
            'course_name',
            'lecturer',
            'lecturer_name',
            'academic_session',
            'session_name',
            'semester',
            'semester_type',
            'target_levels',
            'target_departments',
        ]
        read_only_fields = ['lecturer']

    def validate_target_levels(self, value):
        invalid = [v for v in value if v not in LEVEL_CHOICES]
        if invalid:
            raise serializers.ValidationError(
                f'Invalid levels: {invalid}. Choices are {LEVEL_CHOICES}.'
            )
        return value

    def validate_target_departments(self, value):
        invalid = [v for v in value if v not in DEPARTMENT_CHOICES]
        if invalid:
            raise serializers.ValidationError(
                f'Invalid departments: {invalid}. Choices are {DEPARTMENT_CHOICES}.'
            )
        return value


class ClassEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    matric_number = serializers.CharField(source='student.matric_number', read_only=True)

    class Meta:
        model = ClassEnrollment
        fields = ['id', 'student', 'student_name', 'matric_number', 'course', 'is_class_rep']
        read_only_fields = ['is_class_rep']


class AssignRepSerializer(serializers.Serializer):
    """Payload for the assign-rep action."""

    student_id = serializers.PrimaryKeyRelatedField(
        queryset=StudentProfile.objects.all(),
        help_text='Primary key of the StudentProfile to assign as class rep.',
    )
