from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext_lazy as _
from PIL import Image, UnidentifiedImageError

ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]
ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

IMAGE_EXTENSION_VALIDATOR = FileExtensionValidator(
    allowed_extensions=ALLOWED_IMAGE_EXTENSIONS
)


def validate_image_size(image) -> None:
    if image.size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError(_("Размер изображения должен быть не больше 5 MB."))


def validate_image_content_type(image) -> None:
    content_type = getattr(image, "content_type", "")
    if content_type and content_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise ValidationError(_("Допустимые форматы изображений: JPEG, PNG и WebP."))


def validate_image_file_signature(image) -> None:
    current_position = None
    try:
        if hasattr(image, "tell"):
            current_position = image.tell()

        opened_image = Image.open(image)
        image_format = opened_image.format
        opened_image.verify()
    except (UnidentifiedImageError, OSError):
        raise ValidationError(_("Загрузите корректное изображение JPEG, PNG или WebP."))
    finally:
        if current_position is not None and hasattr(image, "seek"):
            image.seek(current_position)

    if image_format not in ALLOWED_IMAGE_FORMATS:
        raise ValidationError(_("Допустимые форматы изображений: JPEG, PNG и WebP."))


def validate_image_upload(image) -> None:
    validate_image_size(image)
    validate_image_content_type(image)
    validate_image_file_signature(image)
