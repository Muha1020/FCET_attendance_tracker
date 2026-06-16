import re
from django.core.exceptions import ValidationError

MATRIC_REGEX = r'^\d{2}/\d{2}[A-Z]+\d{3}$'

# TODO: Update STAFF_ID_REGEX once the official staff ID format is confirmed by the registrar.
# Current placeholder accepts 2-4 uppercase letters followed by 3-6 digits (e.g. LECT001, SS12345).
STAFF_ID_REGEX = r'^[A-Z]{2,4}\d{3,6}$'


def validate_matric_number(value):
    """Validate matric number format: YY/YYDEPTnnn (e.g. 23/03CMP019)."""
    if not re.match(MATRIC_REGEX, value):
        raise ValidationError(
            'Invalid matric number format. Expected: YY/YYDEPTnnn (e.g. 23/03CMP019).'
        )


def validate_staff_id(value):
    """Validate staff ID format (placeholder — update STAFF_ID_REGEX when format is confirmed)."""
    if not re.match(STAFF_ID_REGEX, value):
        raise ValidationError(
            'Invalid staff ID format. Contact the admin if you believe this is an error.'
        )


def detect_role(identifier: str) -> str | None:
    """Return 'student', 'lecturer', or None based on the identifier format."""
    if re.match(MATRIC_REGEX, identifier):
        return 'student'
    if re.match(STAFF_ID_REGEX, identifier):
        return 'lecturer'
    return None
