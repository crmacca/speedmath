from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("quizhistory", views.quiz_history, name="quiz_history"),
    path("createquiz", views.create_quiz, name="create_quiz"),
    path("quiz/<id>/", views.quiz_viewer, name="quiz_viewer"),
    path("quiz/submit", views.submit_answer, name="submit_answer"),
    path("quiz/delete", views.delete_quiz, name="delete_quiz"),
]