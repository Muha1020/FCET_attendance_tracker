import random
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from courses.models import Course
from users.models import StudentProfile


def _generate_pin() -> str:
    return ''.join(str(random.randint(0, 9)) for _ in range(6))


class AttendanceSession(models.Model):
    """
    An open attendance window for a course.
    PIN is auto-generated on creation and lazily refreshed every 60 minutes
    when GET .../pin/ is called (no background worker required).

    # v2: add a location/GPS field here for proximity-based attendance verification.
    """

    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='attendance_sessions'
    )
    date = models.DateField(default=timezone.localdate)
    pin = models.CharField(max_length=6, editable=False)
    pin_expiry = models.DateTimeField(editable=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_sessions',
    )

    class Meta:
        ordering = ['-date', '-id']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.pin = _generate_pin()
            self.pin_expiry = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    def refresh_pin_if_expired(self) -> bool:
        """Regenerate the PIN when it has expired. Returns True if refreshed."""
        if timezone.now() >= self.pin_expiry:
            self.pin = _generate_pin()
            self.pin_expiry = timezone.now() + timedelta(hours=1)
            self.save(update_fields=['pin', 'pin_expiry'])
            return True
        return False

    @property
    def is_pin_expired(self) -> bool:
        return timezone.now() >= self.pin_expiry

    def __str__(self):
        return f'{self.course.course_code} — {self.date} ({"open" if self.is_active else "closed"})'


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]

    attendance_session = models.ForeignKey(
        AttendanceSession, on_delete=models.CASCADE, related_name='records'
    )
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name='attendance_records'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    failure_reason = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']
        constraints = [
            # A student may only have ONE successful record per session.
            # Multiple failed attempts are allowed (each is logged for audit purposes).
            models.UniqueConstraint(
                fields=['attendance_session', 'student'],
                condition=models.Q(status='success'),
                name='unique_successful_attendance',
            )
        ]

    def __str__(self):
        return (
            f'{self.student.matric_number} — '
            f'{self.attendance_session.course.course_code} — {self.status}'
        )
