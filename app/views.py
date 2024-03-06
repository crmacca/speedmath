from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

@login_required(login_url='/users/login/', redirect_field_name="my_redirect_field")
def index(request):
    return render(request, "app/index.html")
    