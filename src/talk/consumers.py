from channels import Group
from .engine import ChatEngine

from channels.sessions import channel_session

# Connected to websocket.connect
def ws_add(message):
    message.reply_channel.send({"accept": True})
#    # Add them to the chat group
#    print (message.reply_channel)
#    Group("chat").add(message.reply_channel)

@channel_session
def ws_connect(message):
    # TODO Move many LOGIN_USER actions from ws_message into ws_add
    pass

@channel_session
def ws_message(message):
    ChatEngine.dispatch(message)

@channel_session
def ws_disconnect(message):
    ChatEngine(message).disconnect()