from django.urls import path
from . import views

urlpatterns = [
    path('frame/', views.proctor_frame, name='proctor_frame'),
    path('end/', views.end_interview, name='end_interview'),  # Endpoint to handle proctoring
]
