from django.contrib import admin

from .models import AcademicSession, Semester
from users.admin import ReadOnlyForAdminGroupMixin


@admin.register(AcademicSession)
class AcademicSessionAdmin(admin.ModelAdmin):
    list_display = ['session_name', 'start_year', 'end_year', 'is_active']
    list_filter = ['is_active']
    search_fields = ['session_name']


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'semester_type', 'is_active']
    list_filter = ['semester_type', 'is_active', 'academic_session']
    raw_id_fields = ['academic_session']
