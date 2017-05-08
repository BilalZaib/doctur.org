from django import forms
from django.contrib.auth.forms import UserCreationForm,UserChangeForm
from django.contrib.auth.models import User
from django.core.files.images import get_image_dimensions
from .models import DoctorProfile,PatientProfile

choice = (
    ('1', 'DOCTOR'),
    ('2', 'PATIENT'),
)

class SignUpForm(UserCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')
    ARE_YOU = forms.ChoiceField(choices=choice)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username',  'email', 'ARE_YOU', 'password1', 'password2', )

class DoctorProfileForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(DoctorProfileForm, self).__init__(*args, **kwargs)
        if self.instance:
            self.fields["avatar"].initial = self.instance.avatar
            self.fields["birth_date"].initial = self.instance.birth_date
            self.fields["address"].initial = self.instance.address
            self.fields["bio"].initial = self.instance.bio
    class Meta:
        model = DoctorProfile
        fields = ['avatar', 'birth_date', 'address','bio']


class PatientProfileForm(forms.ModelForm):
    class Meta:
        model = PatientProfile
        fields = ['avatar', 'birth_date', 'address', 'disease']

class EditProfileForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ['first_name', 'last_name','email']

