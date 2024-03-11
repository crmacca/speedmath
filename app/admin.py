from django.contrib import admin
from app.models import Quiz

class QuizAdmin(admin.ModelAdmin):
    pass


admin.site.register(Quiz, QuizAdmin);