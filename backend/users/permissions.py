from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allows access to admin users and superusers."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == 'admin' or request.user.is_superuser)
        )


class IsLecturer(BasePermission):
    """Allows access to lecturer users only."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'lecturer'
        )


class IsStudent(BasePermission):
    """Allows access to student users only."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'student'
        )


class IsAdminOrLecturer(BasePermission):
    """Allows access to admins, superusers, and lecturers."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role in ('admin', 'lecturer')
                or request.user.is_superuser
            )
        )


class IsLecturerOrClassRep(BasePermission):
    """Allows lecturers and students who are class reps in at least one course."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == 'lecturer':
            return True
        if request.user.role == 'student':
            from courses.models import ClassEnrollment
            return ClassEnrollment.objects.filter(
                student=request.user.student_profile,
                is_class_rep=True,
            ).exists()
        return False
