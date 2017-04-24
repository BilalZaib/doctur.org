from django.utils import timezone
from django.db import models
from django.contrib.auth.models import User

import json

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

    def get_dict(self) :
        return {
            "talk_id": self.talk.id,
            "username": str(self.user.username),
            "timestamp": self.timestamp.strftime("%B %d, %G, %I:%M %p").replace(" 0", " "),
            "content": str(self.content)
        }

    def __str__(self):
        return json.dumps({
            "talk_id": self.talk.id,
            "username": str(self.user.username),
            "timestamp": self.timestamp.strftime("%B %d, %G, %I:%M %p").replace(" 0", " "),
            "content": str(self.content)
        })
