from django.contrib.auth.backends import ModelBackend
from .validators import detect_role


class IdentifierAuthBackend(ModelBackend):
    """
    Authenticates students via matric number and lecturers via staff ID.
    Email-based login (admin/superuser) is handled by Django's default ModelBackend.
    """

    def authenticate(self, request, identifier=None, password=None, **kwargs):
        if not identifier:
            return None

        role = detect_role(identifier)
        user = None

        if role == 'student':
            from .models import StudentProfile
            try:
                profile = StudentProfile.objects.select_related('user').get(
                    matric_number=identifier
                )
                user = profile.user
            except StudentProfile.DoesNotExist:
                return None

        elif role == 'lecturer':
            from .models import LecturerProfile
            try:
                profile = LecturerProfile.objects.select_related('user').get(
                    staff_id=identifier
                )
                user = profile.user
            except LecturerProfile.DoesNotExist:
                return None

        else:
            return None

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
