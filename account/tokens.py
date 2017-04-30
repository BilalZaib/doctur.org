from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        if hasattr(user,'patient'):
            return (
                six.text_type(user.pk) + six.text_type(timestamp) +
                six.text_type(user.patient.email_confirmed)
            )
        elif hasattr(user,'doctor'):
            return (
                six.text_type(user.pk) + six.text_type(timestamp) +
                six.text_type(user.doctor.email_confirmed)
            )

account_activation_token = AccountActivationTokenGenerator()
