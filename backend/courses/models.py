from django.contrib.postgres.fields import ArrayField
from django.db import models

from users.models import StudentProfile, LecturerProfile
from academics.models import AcademicSession, Semester


LEVEL_CHOICES = [100, 200, 300, 400, 500]
DEPARTMENT_CHOICES = [
    'Computer Science',
    'Cybersecurity',
    'Software Engineering',
    'Information Systems',
]


class Course(models.Model):
    """
    A course offered in a given semester.
    target_levels and target_departments define the intended audience; they are used
    to filter students for class rep assignment and the student course list view.
    ArrayField is used over a junction table to keep queries simple.
    """

    course_code = models.CharField(max_length=20, help_text='e.g. CST101')
    course_name = models.CharField(max_length=200)
    lecturer = models.ForeignKey(
        LecturerProfile, on_delete=models.PROTECT, related_name='courses'
    )
    academic_session = models.ForeignKey(
        AcademicSession, on_delete=models.PROTECT, related_name='courses'
    )
    semester = models.ForeignKey(
        Semester, on_delete=models.PROTECT, related_name='courses'
    )
    target_levels = ArrayField(
        models.IntegerField(),
        help_text='List of target levels, e.g. [100, 200].',
    )
    target_departments = ArrayField(
        models.CharField(max_length=50),
        help_text='List of target departments.',
    )

    class Meta:
        # A course code must be unique within a semester.
        unique_together = [['course_code', 'semester']]
        ordering = ['course_code']

    def __str__(self):
        return f'{self.course_code} — {self.course_name}'


class ClassEnrollment(models.Model):
    """
    Tracks which students are class representatives for a course.
    A general enrollment record is also created here for any student
    whose level/department matches the course — is_class_rep defaults to False.
    """

    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name='enrollments'
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='enrollments'
    )
    is_class_rep = models.BooleanField(default=False)

    class Meta:
        unique_together = [['student', 'course']]

    def __str__(self):
        rep = ' (Class Rep)' if self.is_class_rep else ''
        return f'{self.student.matric_number} → {self.course.course_code}{rep}'
