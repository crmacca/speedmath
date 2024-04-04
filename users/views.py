from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

# Defines the login view
def login_view(request):
    # Checks if the request method is POST
    if request.method == "POST":
        # Retrieves username and password from the POST request
        username = request.POST.get("username")
        password = request.POST.get("password")
        # Authenticates the user
        user = authenticate(request, username=username, password=password)
        # If authentication is successful, the user is logged in and redirected to the home page
        if user is not None:
            login(request, user)
            return redirect("/")
        # If authentication fails, returns to the login page with an error message
        else:
            return render(
                request,
                "users/login.html",
                {
                    "message": {
                        "text": "Credentials combination does not match our records.",
                        "type": "Error",
                        "class": "errorBox",
                    }
                },
            )
    # If not a POST request, simply render the login page
    return render(request, "users/login.html")


# Defines the logout view
def logout_view(request):
    # Logs the user out
    logout(request)
    # Redirects to the login page with a success message
    return render(
        request,
        "users/login.html",
        {
            "message": {
                "text": "Successfully Logged Out",
                "type": "Success",
                "class": "successBox",
            }
        },
    )


# Defines the signup view
def signup_view(request):
    # Checks if the request method is POST
    if request.method == "POST":
        # Retrieves username, password, and confirmPassword from the POST request
        username = request.POST.get("username")
        password = request.POST.get("password")
        confirmPassword = request.POST.get("confirmPassword")

        # Checks if the username already exists in the database
        if User.objects.filter(username=username).exists():
            # If the username exists, returns to the signup page with an error message
            return render(
                request,
                "users/signup.html",
                {
                    "message": {
                        "text": "Username already exists. Please choose a different username.",
                        "type": "Error",
                        "class": "errorBox",
                    }
                },
            )

        # Checks if the passwords do not match
        if password != confirmPassword:
            # If they don't match, returns to the signup page with an error message
            return render(
                request,
                "users/signup.html",
                {
                    "message": {
                        "text": "Passwords do not match.",
                        "type": "Error",
                        "class": "errorBox",
                    }
                },
            )

        try:
            # Attempts to create a new user with the given username and password
            user = User.objects.create_user(
                username=username, email=None, password=password
            )
            user.save()

            # Logs the new user in and redirects to the home page
            login(request, user)
            return redirect("/")
        except Exception as e:
            # If there's an error during user creation, prints the error and returns to the signup page with an error message
            print("Unable to create user:", e)
            return render(
                request,
                "users/signup.html",
                {
                    "message": {
                        "text": "An unexpected error occurred. Please try again later.",
                        "type": "Error",
                        "class": "errorBox",
                    }
                },
            )

    # If not a POST request, simply render the signup page
    return render(request, "users/signup.html")
