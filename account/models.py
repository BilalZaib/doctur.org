from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='doctor',primary_key=True)
    bio = models.TextField(max_length=500, blank=True,default = 'Nothing in Bio, Please edit your Profile in Settings')
    address = models.CharField(max_length=100, blank=True, help_text="Complete Adress")
    birth_date = models.DateField(null=True, blank=True,help_text='Required. Format: YYYY-MM-DD')
    email_confirmed = models.BooleanField(default=False)
    avatar = models.ImageField('profile picture', upload_to='static/media/profile_imgs', null=True, blank=True)
    def __str__(self):
        return self.user.username
    def getimg(self):
        if not self.avatar:
            return '/media/static/media/profile_imgs/defualt.png'
        else:
            return self.avatar.url


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='patient',primary_key=True)
    disease = models.TextField(max_length=100, blank=True, help_text="What Disease You have?", default = 'No Disease')
    address = models.CharField(max_length=100, blank=True, help_text="Complete Adress")
    birth_date = models.DateField(null=True, blank=True,help_text='Required. Format: YYYY-MM-DD')
    email_confirmed = models.BooleanField(default=False)
    avatar = models.ImageField('profile picture', upload_to='static/media/profile_imgs', null=True, blank=True)
    def __str__(self):
        return self.user.username
    def getimg(self):
        if not self.avatar:
            return '/media/static/media/profile_imgs/defualt.png'
        else:
            return self.avatar.url


