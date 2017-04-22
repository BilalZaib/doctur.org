from channels import Group, DEFAULT_CHANNEL_LAYER, channel_layers
from talk.models import Message, Talk, User
from django.db.models import Q

from . import constants
from .base import ActionEngine
from .utils import timestamp

class ChatEngine(ActionEngine):

    def get_control_channel(self, user=None):
        # Current control channel name, unless told to return `user`'s
        # control channel
        if user is None:
            user = self.message.channel_session['user']
        return 'control.{0}'.format(user)

    def disconnect(self):
        # Discard the channel from the control group
        Group(self.get_control_channel()).discard(
            self.message.reply_channel
        )

        #username = self.message.channel_session.get('user')
        #if username:
        #    user = User.objects.get(username=username)

    def LOGIN(self, action):
        # Get or create user and assign to session for future requests
        # WARNING: There is NO AUTHENTICATION. Consider moving up to ws_add
        username = action['user']
        user, user_created = User.objects.get_or_create(username=username)
        self.message.channel_session['user'] = username

        # Add this websocket to the user's control channel group
        control = self.get_control_channel()
        self.add(control)

        # Echo back the LOGIN to the client
        self.send({
            'type': constants.LOGIN_SUCCESS,
            'user': username
        })


    def SEND_MESSAGE(self, action):
        username = self.message.channel_session['user']

        talk = Talk.objects.get(id=action['talkId'])

        user = User.objects.get(username=username)
        m = Message.objects.create(
            user=user,
            room=room,
            content=action['content'],
        )

        room_channel = self.get_room_channel(talk.id)
        self.send_to_group(room_channel, {
            'type': 'RECEIVE_MESSAGES',
            'messages': [{
                'id': m.id,
                'roomId': room.id,
                'content': m.content,
                'timestamp': timestamp(m.timestamp),
                'user': username,
            }],
        })

    def REQUEST_MESSAGES(self, action):
        # latest_id, room

        params = Q()

        if 'roomId' in action:
            params &= Q(room_id=action['roomId'])
        
        if 'user' in action:
            params &= Q(room__users__username=action['user'])
        
        if 'lastMessageId' in action:
            # Any messages that occured at or later than time of lastMessage
            prior = Message.objects.get(id=action['lastMessageId'])
            params &= Q(timestamp__gte=prior.timestamp)
        
        if 'firstMessageId' in action:
            # Any messages that occured before the than time of lastMessage
            prior = Message.objects.get(id=action['firstMessageId'])
            params &= Q(timestamp__lte=prior.timestamp)

        messages = Message.objects.filter(
            params
        ).select_related(
            'user'
        ).order_by(
            # Get descending, because of LIMIT, but later reverse order
            # in Python to assist browser's sort
            '-timestamp', '-id'
        )[:50]

        # Reverse since messages displayed ascending
        messages = reversed(messages)

        # Return messages to the user
        self.send({
            'type': 'RECEIVE_MESSAGES',
            'messages': [{
                'id': m.id,
                'roomId': m.room_id,
                'content': m.content,
                'timestamp': timestamp(m.timestamp),
                'user': m.user.username,
            } for m in messages],
        })