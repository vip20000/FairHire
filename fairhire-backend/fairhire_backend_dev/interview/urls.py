# interviews/urls.py
from django.urls import path
from .views import UpdateCandidateView,CandidateListView

urlpatterns = [
    path('update-candidate/', UpdateCandidateView.as_view(), name='update-candidate'),
    path('candidates/', CandidateListView.as_view(), name='candidate-list'),
]