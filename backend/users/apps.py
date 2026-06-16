from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        from django.db.models.signals import post_migrate
        post_migrate.connect(_setup_admin_group, sender=self)


def _setup_admin_group(sender, **kwargs):
    """
    Creates the 'Admins' group with read + write (no delete) access to
    AcademicSession and Semester, and view-only access to Course and AttendanceRecord.
    Runs after every migrate so permissions are always in sync.
    """
    from django.contrib.auth.models import Group, Permission

    admin_group, _ = Group.objects.get_or_create(name='Admins')

    # (model_codename, [allowed_actions])
    targets = [
        ('academicsession', ['view', 'add', 'change']),
        ('semester', ['view', 'add', 'change']),
        ('course', ['view']),
        ('attendancerecord', ['view']),
    ]

    permissions = []
    for model, actions in targets:
        for action in actions:
            try:
                perm = Permission.objects.get(codename=f'{action}_{model}')
                permissions.append(perm)
            except Permission.DoesNotExist:
                pass  # Permissions may not exist yet on the very first migrate

    admin_group.permissions.set(permissions)
