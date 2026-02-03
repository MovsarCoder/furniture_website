from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="CarouselPhoto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=120, verbose_name="Title")),
                ("caption", models.TextField(blank=True, verbose_name="Caption")),
                ("image", models.ImageField(upload_to="carousel/", verbose_name="Image")),
                ("is_active", models.BooleanField(default=True, verbose_name="Active")),
                ("order", models.PositiveIntegerField(default=0, verbose_name="Order")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Carousel photo",
                "verbose_name_plural": "Carousel photos",
                "ordering": ["order", "-created_at"],
            },
        ),
    ]
