from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='doctor',primary_key=True)
    bio = models.TextField(max_length=500, blank=True)
    address = models.CharField(max_length=30, blank=True, help_text="Complete Adress")
    birth_date = models.DateField(null=True, blank=True,help_text='Required. Format: YYYY-MM-DD')
    email_confirmed = models.BooleanField(default=False)
    avatar = models.ImageField('profile picture', upload_to='static/media/images/avatars/', null=True, blank=True)


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='patient',primary_key=True)
    disease = models.TextField(max_length=50, blank=True, help_text="What Disease You have?")
    address = models.CharField(max_length=30, blank=True, help_text="Complete Adress")
    birth_date = models.DateField(null=True, blank=True,help_text='Required. Format: YYYY-MM-DD')
    email_confirmed = models.BooleanField(default=False)
    avatar = models.ImageField('profile picture', upload_to='static/media/images/avatars/', null=True, blank=True)


