# Generated by Django 5.0.1 on 2024-03-12 22:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_rename_quizcompleted_quiz_completed_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='quiz',
            name='correctlyAnswered',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
        migrations.AlterField(
            model_name='quiz',
            name='incorrectlyAnswered',
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
    ]
