from django.shortcuts import render
from django.http.response import HttpResponse
from django import forms

# Create your views here.

def index(request):
    class NameForm(forms.Form):
        your_name = forms.CharField(label='Your name', max_length=100)

    context = { "form" : NameForm() }
    return render(request, 'talk/index.html', context)
    #return HttpResponse("Hello World")

def talk(request, talk_id):
    return HttpResponse("I am talk no " + talk_id)