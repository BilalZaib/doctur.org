# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-29 09:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0002_auto_20170429_1433'),
    ]

    operations = [
        migrations.AddField(
            model_name='doctorprofile',
            name='email_confirmed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='patientprofile',
            name='email_confirmed',
            field=models.BooleanField(default=False),
        ),
    ]