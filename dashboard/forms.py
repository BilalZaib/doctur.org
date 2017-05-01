from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.core.files.images import get_image_dimensions

class EditProfileForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ['first_name', 'last_name','email']
