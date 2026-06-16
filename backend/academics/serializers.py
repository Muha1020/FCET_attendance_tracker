from rest_framework import serializers
from .models import AcademicSession, Semester


class AcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = ['id', 'session_name', 'start_year', 'end_year', 'is_active']

    def validate(self, data):
        if data.get('start_year') and data.get('end_year'):
            if data['end_year'] != data['start_year'] + 1:
                raise serializers.ValidationError(
                    'end_year must be exactly one year after start_year.'
                )
        return data


class SemesterSerializer(serializers.ModelSerializer):
    academic_session_name = serializers.CharField(
        source='academic_session.session_name', read_only=True
    )

    class Meta:
        model = Semester
        fields = ['id', 'academic_session', 'academic_session_name', 'semester_type', 'is_active']
