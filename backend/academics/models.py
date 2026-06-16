from django.db import models


class AcademicSession(models.Model):
    """Represents an academic year, e.g. 2025/2026."""

    session_name = models.CharField(max_length=20, unique=True, help_text='e.g. 2025/2026')
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField()
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ['-start_year']

    def __str__(self):
        return self.session_name


class Semester(models.Model):
    SEMESTER_CHOICES = [
        ('Harmattan', 'Harmattan'),
        ('Rain', 'Rain'),
    ]

    academic_session = models.ForeignKey(
        AcademicSession, on_delete=models.CASCADE, related_name='semesters'
    )
    semester_type = models.CharField(max_length=20, choices=SEMESTER_CHOICES)
    is_active = models.BooleanField(default=False)

    class Meta:
        unique_together = [['academic_session', 'semester_type']]
        ordering = ['academic_session', 'semester_type']

    def __str__(self):
        return f'{self.academic_session} — {self.semester_type}'
