from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from datetime import datetime

@login_required(login_url='/users/login/', redirect_field_name="my_redirect_field")
def index(request):
    now = datetime.now()
    current_hour = now.hour
    if 5 <= current_hour < 12:
        greeting = "Good morning"
    elif 12 <= current_hour < 18:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"

    return render(request, "app/index.html", {
        "greeting": greeting
    })
    