from rest_framework import serializers

from users.models import StudentProfile
from .models import Course, ClassEnrollment, LEVEL_CHOICES, DEPARTMENT_CHOICES


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
