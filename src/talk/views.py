from django.shortcuts import render
from django.http.response import HttpResponse
from django import forms
from django.db.models import Q

from talk.models import User, Talk

# Create your views here.

def index(request):
    return render(request, 'talk/index.html', {})
    
def talk(request, talk_id):
    t = Talk.objects.get(pk=talk_id)
    name = ",".join(x.username for x in t.users.all().exclude(username=request.session.get('username')))
    if t:
        context = {
            "name": name,
            "user": request.session.get('username')   
        }
        return render(request, 'talk/chat.html', context)
    return redirect("/talk/")

def directory(request):
    try:
        u = User.objects.get(pk=int(request.GET['pk']));
        request.session['username'] = u.username
        request.session['userid'] = u.id
    except Exception:
        pass

    context = {
        "user_list": User.objects.filter(~Q(pk=request.session['userid'])) 
    }
    print (context);
    return render(request, 'talk/directory.html', context)

def get_talk(request):

    if 'users' not in request.GET:
        return HttpResponse("Invalid Request");

    users = request.GET.get("users").split(",") + [request.session.get('userid')]
    t = Talk.objects.filter(users__pk__in=users);
    if t:
        return HttpResponse(t[0].id)

    t = Talk();
    t.save();

    for user in users:
        if user != '':
            t.users.add(user)

    return HttpResponse(t.id)
