from .engine import ChatEngine
from channels import Channel, Group
from channels.sessions import channel_session
from channels.auth import channel_session_user, channel_session_user_from_http

import json

from django.contrib.auth.models import User

from talk.models import Message, Talk

@channel_session_user_from_http
def ws_add(message):
    if message.user.is_authenticated:
        message.reply_channel.send({"accept": True})
        Group("chat-%s" % message.user.username).add(message.reply_channel)
    else:
        message.reply_channel.send({"reject": True})


#@channel_session_user
#def ws_connect(message):
#    pass


@channel_session_user
def ws_message(message): 
    action = json.loads(message.content['text'])
    msg = None;

    if action['type'] == "send_message":    
        if Talk.objects.filter(users__pk=message.user.id):
            talk = Talk.objects.get(pk=action['talk_id'])
            user = User.objects.get(pk=message.user.id)
            content = action['content']
            m = Message(talk=talk, user=user, content=content)
            m.save()   
            for user in talk.users.all():
                Group("chat-%s" % user.username).send({
                    "text": str(m),
                })

@channel_session_user
def ws_disconnect(message):
    pass
    #ChatEngine(message).disconnect()