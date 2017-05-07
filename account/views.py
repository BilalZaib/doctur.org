from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.sites.shortcuts import get_current_site
from django.shortcuts import render, redirect
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string

from .forms import SignUpForm,DoctorProfileForm,PatientProfileForm
from .tokens import account_activation_token
from .models import DoctorProfile,PatientProfile


@login_required
def home(request):
    return render(request, 'account/home.html')


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()

            userType = str(form.cleaned_data.get('ARE_YOU'))
            if userType == "1":
                DoctorProfile.objects.create(user=user)
            elif userType == '2':
                PatientProfile.objects.create(user=user)

            current_site = get_current_site(request)
            subject = 'Activate Your Doctur.org Account'
            message = render_to_string('account/account_activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': account_activation_token.make_token(user),
            })
            user.email_user(subject, message)

            return redirect('account_activation_sent')
    else:
        form = SignUpForm()
    return render(request, 'account/signup.html', {'form': form})


def account_activation_sent(request):
    return render(request, 'account/account_activation_sent.html')


def activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        if hasattr(user, 'patient'):
            user.patient.email_confirmed = True
            user.save()
            login(request, user)
            return pp(request,user)
        elif hasattr(user, 'doctor'):
            user.doctor.email_confirmed = True
            user.save()
            login(request, user)
            return dp(request,user)

        #return redirect('/dashboard')
    else:
        return render(request, 'account/account_activation_invalid.html')

def dp(request,u):
    if request.method == 'POST':
        form = DoctorProfileForm(request.POST,request.FILES)
        if form.is_valid():
            dp = DoctorProfile.objects.get(user=u)
            u.refresh_from_db()
            dp.avatar = request.FILES.get('avatar')
            dp.birth_date = form.cleaned_data.get('birth_date')
            dp.address = form.cleaned_data.get('address')
            dp.save()
            return redirect('/dashboard')
    else:
        form = DoctorProfileForm()
    return render(request,'account/doctorProfile.html', {'form': form})

def pp(request,u):
    if request.method == 'POST':
        form = PatientProfileForm(request.POST,request.FILES)
        if form.is_valid():
            pp = PatientProfile.objects.get(user=u)
            u.refresh_from_db()
            pp.avatar = request.FILES.get('avatar')
            pp.birth_date = form.cleaned_data.get('birth_date')
            pp.address = form.cleaned_data.get('address')
            pp.disease = form.cleaned_data.get('disease')
            pp.save()

            return redirect('/dashboard')
    else:
        form = PatientProfileForm()
    return render(request,'account/patientProfile.html', {'form': form})