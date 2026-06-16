from django.contrib import admin

from .models import Course, ClassEnrollment
from users.admin import ReadOnlyForAdminGroupMixin


@admin.register(Course)
class CourseAdmin(ReadOnlyForAdminGroupMixin, admin.ModelAdmin):
    list_display = [
        'course_code', 'course_name', 'get_lecturer', 'academic_session', 'semester',
    ]
    list_filter = ['academic_session', 'semester']
    search_fields = ['course_code', 'course_name', 'lecturer__user__full_name']
    raw_id_fields = ['lecturer', 'academic_session', 'semester']

    @admin.display(description='Lecturer')
    def get_lecturer(self, obj):
        return obj.lecturer.user.full_name


@admin.register(ClassEnrollment)
class ClassEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'is_class_rep']
    list_filter = ['is_class_rep']
    raw_id_fields = ['student', 'course']
