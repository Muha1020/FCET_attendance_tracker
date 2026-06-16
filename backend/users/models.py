from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager
from .validators import validate_matric_number, validate_staff_id


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('lecturer', 'Lecturer'),
        ('student', 'Student'),
    ]

    username = None
    # null=True so students/lecturers (who have no email) don't collide on the unique constraint.
    # PostgreSQL treats each NULL as distinct, so multiple null emails are allowed.
    email = models.EmailField(unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f'{self.full_name} ({self.get_role_display()})'


class AdminProfile(models.Model):
    """Profile for users with the admin role (distinct from Django superuser)."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='admin_profile'
    )

    def __str__(self):
        return f'Admin: {self.user.full_name}'


class StudentProfile(models.Model):
    LEVEL_CHOICES = [
        (100, '100 Level'),
        (200, '200 Level'),
        (300, '300 Level'),
        (400, '400 Level'),
        (500, '500 Level'),
    ]

    DEPARTMENT_CHOICES = [
        ('Computer Science', 'Computer Science'),
        ('Cybersecurity', 'Cybersecurity'),
        ('Software Engineering', 'Software Engineering'),
        ('Information Systems', 'Information Systems'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='student_profile'
    )
    matric_number = models.CharField(
        max_length=20, unique=True, validators=[validate_matric_number]
    )
    level = models.IntegerField(choices=LEVEL_CHOICES)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)

    def __str__(self):
        return f'{self.matric_number} — {self.user.full_name}'


class LecturerProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='lecturer_profile'
    )
    # TODO: Update validator regex in validators.py once the staff ID format is confirmed.
    staff_id = models.CharField(
        max_length=20, unique=True, validators=[validate_staff_id]
    )

    def __str__(self):
        return f'{self.staff_id} — {self.user.full_name}'
