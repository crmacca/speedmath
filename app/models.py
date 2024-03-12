from django.db import models
from django.contrib.auth.models import User
import uuid

class Quiz(models.Model):
    quizId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quizCompleted = models.BooleanField(default=False)
    quizCorrectlyCompleted = models.PositiveIntegerField(default=0, null=False, blank=False)
    quizQuestionsTotal = models.PositiveIntegerField(default=0, null=False, blank=False)
    quizQuestions = models.JSONField()
    incorrectQuestions = models.JSONField(null=True, blank=True)
    revised = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quizzes')
