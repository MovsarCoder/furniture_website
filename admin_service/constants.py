from django.utils.translation import gettext_lazy as _

LANGUAGE_CHOICES = [
    ("en", _("English")),
    ("de", _("Deutsch")),
    ("fr", _("Français")),
]

COUNTRY_CHOICES = [
    ("at", _("Austria")),
    ("fr", _("France")),
]

WORK_TYPES = [
    ("custom", _("Custom")),
    ("template", _("Template")),
    ("restoration", _("Restoration")),
    ("assembly", _("Assembly")),
    ("design", _("Design project")),
]

WORK_STATUSES = [
    ("in_progress", _("In production")),
    ("completed", _("Completed")),
    ("delivered", _("Delivered")),
]

CONSULTATION_TYPES = [
    ("design", _("Design project")),
    ("custom", _("Custom order")),
    ("repair", _("Repair / Restoration")),
    ("general", _("General consultation")),
]

CONSULTATION_STATUSES = [
    ("new", _("New")),
    ("in_progress", _("In progress")),
    ("completed", _("Completed")),
    ("cancelled", _("Cancelled")),
]

COUNTRY_CODES = {code for code, _ in COUNTRY_CHOICES}

DEFAULT_COUNTRY_CODE = "at"
DEFAULT_LANGUAGE_CODE = "en"
