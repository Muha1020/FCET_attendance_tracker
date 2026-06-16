from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import User, StudentProfile, LecturerProfile
from .validators import detect_role


class RegistrationSerializer(serializers.Serializer):
    """Handles student and lecturer registration. Role is auto-detected from the identifier."""

    full_name = serializers.CharField(max_length=255)
    identifier = serializers.CharField(
        help_text='Matric number (student) or staff ID (lecturer).'
    )
    password = serializers.CharField(write_only=True, min_length=8)
    level = serializers.ChoiceField(
        choices=StudentProfile.LEVEL_CHOICES, required=False,
        help_text='Required for students.'
    )
    department = serializers.ChoiceField(
        choices=StudentProfile.DEPARTMENT_CHOICES, required=False,
        help_text='Required for students.'
    )

    def validate(self, data):
        identifier = data['identifier']
        role = detect_role(identifier)

        if role is None:
            raise serializers.ValidationError(
                'Invalid identifier. Provide a valid matric number (student) '
                'or staff ID (lecturer).'
            )

        if role == 'student':
            if not data.get('level'):
                raise serializers.ValidationError(
                    {'level': 'This field is required for student registration.'}
                )
            if not data.get('department'):
                raise serializers.ValidationError(
                    {'department': 'This field is required for student registration.'}
                )

        data['_role'] = role
        return data

    def create(self, validated_data):
        role = validated_data.pop('_role')
        identifier = validated_data['identifier']

        with transaction.atomic():
            user = User.objects.create_user(
                email=None,
                password=validated_data['password'],
                full_name=validated_data['full_name'],
                role=role,
            )

            if role == 'student':
                StudentProfile.objects.create(
                    user=user,
                    matric_number=identifier,
                    level=validated_data['level'],
                    department=validated_data['department'],
                )
            elif role == 'lecturer':
                LecturerProfile.objects.create(
                    user=user,
                    staff_id=identifier,
                )

        return user


class LoginSerializer(serializers.Serializer):
    """Authenticate via matric number (student) or staff ID (lecturer)."""

    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            request=self.context.get('request'),
            identifier=data['identifier'],
            password=data['password'],
        )
        if not user:
            raise serializers.ValidationError('Invalid identifier or password.')
        data['_user'] = user
        return data


class StudentProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'full_name', 'role', 'matric_number', 'level', 'department']


class LecturerProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = LecturerProfile
        fields = ['id', 'full_name', 'role', 'staff_id']
