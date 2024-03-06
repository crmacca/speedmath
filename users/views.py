from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import redirect

def index(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    return render(request, "users/user.html")
    
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
        name = request.POST.get("name")
        username = request.POST.get("username")
        password = request.POST.get("password")
        confirmPassword = request.POST.get("confirmPassword")

        if password == confirmPassword:
            try:
                alreadyExisting = User.objects.get(username=username)

                if alreadyExisting :
                    return render(request, "users/signup.html", {
                        "message": {
                            "text": "Username taken, please try another one.",
                            "type": "Error",
                            "class": "errorBox"
                        }
                    })

                user = User.objects.create_user(username, password)
                user.save()
                
                user.profile.name = name
                user.profile.save()

                login(request, user)
                return redirect('/')
            except Exception as e:
                print("Unable to create user:", e)
                return render(request, "users/signup.html", {
                    "message": {
                        "text": str(e),
                        "type": "Error",
                        "class": "errorBox"
                    }
                })
        else:
            return render(request, "users/signup.html", {
                "message": {
                    "text": "Passwords do not match.",
                    "type": "Error",
                    "class": "errorBox"
                }
            })

    return render(request, "users/signup.html")
