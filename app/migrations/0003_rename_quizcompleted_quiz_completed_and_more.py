# Generated by Django 5.0.1 on 2024-03-12 05:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_quiz_incorrectquestions_quiz_quizquestionstotal_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='quiz',
            old_name='quizCompleted',
            new_name='completed',
        ),
        migrations.RenameField(
            model_name='quiz',
            old_name='quizId',
            new_name='id',
        ),
        migrations.RemoveField(
            model_name='quiz',
            name='incorrectQuestions',
        ),
        migrations.RemoveField(
            model_name='quiz',
            name='quizCorrectlyCompleted',
        ),
        migrations.RemoveField(
            model_name='quiz',
            name='quizQuestions',
        ),
        migrations.RemoveField(
            model_name='quiz',
            name='quizQuestionsTotal',
        ),
        migrations.AddField(
            model_name='quiz',
            name='correctlyAnswered',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='quiz',
            name='incorrectlyAnswered',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='quiz',
            name='unanswered',
            field=models.JSONField(default=dict),
        ),
    ]
