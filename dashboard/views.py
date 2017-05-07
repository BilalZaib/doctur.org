from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from .forms import EditProfileForm

@login_required
def index(request):
    return render(request, 'dashboard/home.html')

@login_required
def profile(request):
    user = request.user
    if hasattr(user, 'patient'):
        return render(request, 'dashboard/pat_profile.html')
    elif hasattr(user, 'doctor'):
        return render(request, 'dashboard/doc_profile.html')

@login_required
def setting(request):
    return render(request, 'dashboard/setting.html')

@login_required
def edit_profile(request):

    user = request.user
    form = EditProfileForm(request.POST or None, instance = user)
    if request.method == 'POST':
        if form.is_valid():
            user.first_name = request.POST['first_name']
            user.last_name = request.POST['last_name']
            user.email = request.POST['email']
            user.save()
            if hasattr(user, 'patient'):
                return render(request, 'dashboard/pat_profile.html')
            elif hasattr(user, 'doctor'):
                return render(request, 'dashboard/doc_profile.html')
    else:
        form = EditProfileForm(request.POST or None,
                               initial={'first_name': user.first_name, 'last_name': user.last_name, 'email':user.email})
    return render(request, "dashboard/edit_profile.html", {'form': form})

