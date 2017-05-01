from django.contrib import admin
from .models import DoctorProfile,PatientProfile

# Register your models here.
admin.site.register(DoctorProfile)
admin.site.register(PatientProfile)
