from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('/')
        else:
            return render(request, "users/login.html", {
                'message': {
                    "text": "Credentials combination does not match our records.",
                    "type": "Error",
                    "class": "errorBox"
                }
            })
    return render(request, "users/login.html")


def logout_view(request):
    logout(request)
    return render(request, "users/login.html", {
        "message": {
            "text": "Successfully Logged Out",
            "type": "Success",
            "class": "successBox"
        }
    })

def signup_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        confirmPassword = request.POST.get("confirmPassword")

        if User.objects.filter(username=username).exists():
            return render(request, "users/signup.html", {
                "message": {
                    "text": "Username already exists. Please choose a different username.",
                    "type": "Error",
                    "class": "errorBox"
                }
            })

        if password != confirmPassword:
            return render(request, "users/signup.html", {
                "message": {
                    "text": "Passwords do not match.",
                    "type": "Error",
                    "class": "errorBox"
                }
            })

        try:
            user = User.objects.create_user(username=username, email=None, password=password)
            user.save()

            login(request, user)
            return redirect('/')
        except Exception as e:
            print("Unable to create user:", e)
            return render(request, "users/signup.html", {
                "message": {
                    "text": "An unexpected error occurred. Please try again later.",
                    "type": "Error",
                    "class": "errorBox"
                }
            })

    return render(request, "users/signup.html")
