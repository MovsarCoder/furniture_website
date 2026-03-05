from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("admin_service", "0006_remove_carouselphoto_caption_and_more"),
    ]

    operations = [
        migrations.DeleteModel(
            name="Stats",
        ),
    ]
