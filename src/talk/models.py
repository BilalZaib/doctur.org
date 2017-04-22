from django.utils import timezone
from django.db import models
from django.contrib.auth.models import User

class Talk(models.Model):
    users = models.ManyToManyField(User)

    def name(self, current_username):
        return str(self.users.exclude(username=current_username)[0])

    def __str__(self):
        return '-'.join(
            x[0] for x in self.users.order_by('id').values_list('username')
        )


class Message(models.Model):
    talk = models.ForeignKey(Talk, related_name='messages')
    user = models.ForeignKey(User)
    timestamp = models.DateTimeField(db_index=True, default=timezone.now)
    content = models.TextField()

    def __str__(self):
        return '{0} at {1}'.format(self.user, self.timestamp)