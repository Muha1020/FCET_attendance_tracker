from django.contrib import admin

from .models import AttendanceSession, AttendanceRecord
from users.admin import ReadOnlyForAdminGroupMixin


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ['course', 'date', 'is_active', 'created_by']
    list_filter = ['is_active', 'date']
    search_fields = ['course__course_code', 'course__course_name']
    raw_id_fields = ['course', 'created_by']
    readonly_fields = ['pin', 'pin_expiry']


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(ReadOnlyForAdminGroupMixin, admin.ModelAdmin):
    list_display = [
        'get_matric', 'get_course', 'timestamp', 'status', 'failure_reason',
    ]
    list_filter = ['status', 'attendance_session__course']
    search_fields = [
        'student__matric_number',
        'student__user__full_name',
        'attendance_session__course__course_code',
    ]
    raw_id_fields = ['attendance_session', 'student']

    @admin.display(description='Matric number')
    def get_matric(self, obj):
        return obj.student.matric_number

    @admin.display(description='Course')
    def get_course(self, obj):
        return obj.attendance_session.course.course_code
