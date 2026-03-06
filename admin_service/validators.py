from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext_lazy as _

IMAGE_EXTENSION_VALIDATOR = FileExtensionValidator(
    allowed_extensions=["jpg", "jpeg", "png", "webp"]
)


def validate_image_size(image) -> None:
    max_size_bytes = 8 * 1024 * 1024
    if image.size > max_size_bytes:
        raise ValidationError(_("Image size must be 8 MB or smaller."))
