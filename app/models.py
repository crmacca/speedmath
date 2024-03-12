from django.db import models
from django.contrib.auth.models import User
import uuid

class Quiz(models.Model): 
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unanswered = models.JSONField(default=dict)
    incorrectlyAnswered = models.JSONField(default=dict, blank=True, null=True)
    correctlyAnswered = models.JSONField(default=dict, blank=True, null=True)
    completed = models.BooleanField(default=False)
    revised = models.BooleanField(default=False)
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='quizzes')
