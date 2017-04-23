from django.shortcuts import render, redirect
from django.http.response import HttpResponse
from django import forms
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.contrib.auth.models import User

from talk.models import Talk, Message
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.

@login_required
def index(request):
    return render(request, 'dashboard/talk/index.html', {})

@login_required
def talk(request, talk_id):    
    try:
        t = Talk.objects.get(pk=talk_id)

        # Can current user use this talk, If now throw exception
        if not Talk.objects.filter(users__pk=request.user.id):
            return redirect("/talk/directory")

        name = ",".join(x.username for x in t.users.all().exclude(username=request.user.username))
        context = {
            "talk_id": talk_id,
            "name": name,
            "userid": request.user.id,
            "user": request.user.username,   
            "chat": Message.objects.filter(talk__id=talk_id).order_by('id')  
        }
        return render(request, 'dashboard/talk/chat.html', context)
    except ObjectDoesNotExist:
        return redirect("/talk/directory")

@login_required
def directory(request):
    context = {
        "user_list": User.objects.filter(~Q(pk=request.user.id)) 
    }
    return render(request, 'dashboard/talk/directory.html', context)

@login_required
def get_talk(request):

    if 'users' not in request.GET:
        return HttpResponse("Invalid Request");

    users = request.GET.get("users").split(",") + [request.user.id]
    
    t = Talk.objects.filter(users__pk__in=users).annotate(num_tags=Count('users')).filter(num_tags=2)
    if t:
        return HttpResponse(t[0].id)

    t = Talk();
    t.save();

    for user in users:
        if user != '':
            t.users.add(user)
    t.save()
    return HttpResponse(t.id)
