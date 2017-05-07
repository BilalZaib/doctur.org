from django import forms
from django.contrib.auth.forms import UserCreationForm
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
        fields = ('username', 'first_name', 'last_name',  'email', 'ARE_YOU', 'password1', 'password2', )


class DoctorProfileForm(forms.ModelForm):
    class Meta:
        model = DoctorProfile
        fields = ['avatar', 'birth_date', 'address']

     # def clean_avatar(self):
     #     avatar = self.cleaned_data['avatar']
     #
     #     try:
     #         w, h = get_image_dimensions(avatar)
     #
     #         #validate dimensions
     #         max_width = max_height = 100
     #         if w > max_width or h > max_height:
     #             raise forms.ValidationError(
     #                 u'Please use an image that is '
     #                  '%s x %s pixels or smaller.' % (max_width, max_height))
     #
     #         #validate content type
     #         main, sub = avatar.content_type.split('/')
     #         if not (main == 'image' and sub in ['jpeg', 'pjpeg', 'gif', 'png']):
     #             raise forms.ValidationError(u'Please use a JPEG, '
     #                 'GIF or PNG image.')
     #
     #         #validate file size
     #         if len(avatar) > (20 * 1024):
     #             raise forms.ValidationError(
     #                 u'Avatar file size may not exceed 20k.')
     #
     #     except AttributeError:
     #         """
     #         Handles case when we are updating the user profile
     #         and do not supply a new avatar
     #         """
     #         pass
     #
     #     return avatar

class PatientProfileForm(forms.ModelForm):
    class Meta:
        model = PatientProfile
        fields = ['avatar', 'birth_date', 'address', 'disease']

     # def clean_avatar(self):
     #     avatar = self.cleaned_data['avatar']
     #
     #     try:
     #         w, h = get_image_dimensions(avatar)
     #
     #         #validate dimensions
     #         max_width = max_height = 100
     #         if w > max_width or h > max_height:
     #             raise forms.ValidationError(
     #                 u'Please use an image that is '
     #                  '%s x %s pixels or smaller.' % (max_width, max_height))
     #
     #         #validate content type
     #         main, sub = avatar.content_type.split('/')
     #         if not (main == 'image' and sub in ['jpeg', 'pjpeg', 'gif', 'png']):
     #             raise forms.ValidationError(u'Please use a JPEG, '
     #                 'GIF or PNG image.')
     #
     #         #validate file size
     #         if len(avatar) > (20 * 1024):
     #             raise forms.ValidationError(
     #                 u'Avatar file size may not exceed 20k.')
     #
     #     except AttributeError:
     #         """
     #         Handles case when we are updating the user profile
     #         and do not supply a new avatar
     #         """
     #         pass
     #
     #     return avatar
