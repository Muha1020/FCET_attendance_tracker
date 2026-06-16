from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, AdminProfile, StudentProfile, LecturerProfile


class ReadOnlyForAdminGroupMixin:
    """Strips delete (and write) access for non-superuser members of the Admins group."""

    def has_delete_permission(self, request, obj=None):
        if not request.user.is_superuser and request.user.groups.filter(name='Admins').exists():
            return False
        return super().has_delete_permission(request, obj)

    def has_add_permission(self, request):
        if not request.user.is_superuser and request.user.groups.filter(name='Admins').exists():
            return False
        return super().has_add_permission(request)

    def has_change_permission(self, request, obj=None):
        if not request.user.is_superuser and request.user.groups.filter(name='Admins').exists():
            return False
        return super().has_change_permission(request, obj)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ['email']
    list_display = ['email', 'full_name', 'role', 'is_active', 'is_staff']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['email', 'full_name']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ['user']
    raw_id_fields = ['user']


@admin.register(StudentProfile)
class StudentProfileAdmin(ReadOnlyForAdminGroupMixin, admin.ModelAdmin):
    list_display = ['matric_number', 'get_full_name', 'level', 'department']
    list_filter = ['level', 'department']
    search_fields = ['matric_number', 'user__full_name']

    @admin.display(description='Full name')
    def get_full_name(self, obj):
        return obj.user.full_name


@admin.register(LecturerProfile)
class LecturerProfileAdmin(ReadOnlyForAdminGroupMixin, admin.ModelAdmin):
    list_display = ['staff_id', 'get_full_name']
    search_fields = ['staff_id', 'user__full_name']

    @admin.display(description='Full name')
    def get_full_name(self, obj):
        return obj.user.full_name
