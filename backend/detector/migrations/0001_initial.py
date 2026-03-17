from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='DetectionRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uploaded_image', models.ImageField(upload_to='uploads/')),
                ('result_image', models.CharField(blank=True, max_length=512)),
                ('detections_json', models.TextField(default='[]')),
                ('object_count', models.PositiveIntegerField(default=0)),
                ('unique_labels', models.CharField(blank=True, max_length=1024)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('processing_time_ms', models.FloatField(default=0.0)),
            ],
            options={
                'verbose_name': 'Detection Record',
                'verbose_name_plural': 'Detection Records',
                'ordering': ['-created_at'],
            },
        ),
    ]
