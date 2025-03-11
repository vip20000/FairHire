import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import interview.routing  # Import WebSocket routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fairhire_backend_dev.settings")
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Handles HTTP requests
    "websocket": AuthMiddlewareStack(
        URLRouter(interview.routing.websocket_urlpatterns)
    ),  # Handles WebSocket connections
})
