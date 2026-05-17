from django import forms
from django.utils.translation import gettext_lazy as _

from admin_service.models import Work
from admin_service.validators import validate_image_upload

MIN_WORK_IMAGES = 1
MAX_WORK_IMAGES = 10
WORK_IMAGES_INLINE_PREFIX = "images"


class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class MultipleImageField(forms.FileField):
    widget = MultipleFileInput(
        attrs={
            "accept": "image/jpeg,image/png,image/webp",
            "multiple": True,
        }
    )

    def clean(self, data, initial=None):
        if not data:
            return []
        if not isinstance(data, (list, tuple)):
            data = [data]

        cleaned_files = []
        errors = []
        for uploaded_file in data:
            try:
                cleaned_files.append(super().clean(uploaded_file, initial))
            except forms.ValidationError as exc:
                errors.extend(exc.error_list)

        if errors:
            raise forms.ValidationError(errors)

        return cleaned_files


class WorkAdminForm(forms.ModelForm):
    new_images = MultipleImageField(
        required=False,
        label=_("Добавить изображения товара"),
        help_text=_(
            "Всего у товара должно быть от 1 до 10 изображений. "
            "JPEG, PNG или WebP, до 5 MB каждое."
        ),
        validators=[validate_image_upload],
    )

    class Meta:
        model = Work
        exclude = ("image",)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        existing_count = self._existing_image_count()
        self.fields["new_images"].widget.attrs.update(
            {
                "data-existing-count": existing_count,
                "data-min-images": MIN_WORK_IMAGES,
                "data-max-images": MAX_WORK_IMAGES,
                "data-max-size": 5 * 1024 * 1024,
            }
        )

    def clean(self):
        cleaned_data = super().clean()
        new_images = cleaned_data.get("new_images") or []
        final_count = (
            self._existing_image_count()
            - self._deleted_existing_image_count()
            + len(new_images)
        )

        if final_count < MIN_WORK_IMAGES:
            self.add_error(
                "new_images",
                _("У товара должно быть минимум 1 изображение."),
            )
        if final_count > MAX_WORK_IMAGES:
            self.add_error(
                "new_images",
                _("У товара может быть максимум 10 изображений."),
            )

        return cleaned_data

    def _existing_image_count(self) -> int:
        if not self.instance.pk:
            return 0

        related_count = self.instance.images.count()
        if related_count:
            return related_count

        return 1 if self.instance.image else 0

    def _deleted_existing_image_count(self) -> int:
        if not self.data:
            return 0

        try:
            total_forms = int(
                self.data.get(f"{WORK_IMAGES_INLINE_PREFIX}-TOTAL_FORMS") or 0
            )
        except (TypeError, ValueError):
            return 0

        deleted_count = 0
        for index in range(total_forms):
            image_id = self.data.get(f"{WORK_IMAGES_INLINE_PREFIX}-{index}-id")
            is_deleted = self.data.get(f"{WORK_IMAGES_INLINE_PREFIX}-{index}-DELETE")
            if image_id and is_deleted:
                deleted_count += 1

        return deleted_count
