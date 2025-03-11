from django.urls import re_path
from .consumers import QGenConsumer

websocket_urlpatterns = [
    re_path(r"ws/qgen/$", QGenConsumer.as_asgi()),
]
