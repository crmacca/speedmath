from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("createquiz", views.create_quiz, name="create_quiz"),
    path("quiz/<id>/", views.quiz_viewer, name="quiz_viewer"),
    path("quiz/submit", views.submit_answer, name="submit_answer"),
]