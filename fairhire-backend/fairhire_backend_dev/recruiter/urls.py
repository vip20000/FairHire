from django.urls import path
from .views import (
    get_csrf_token,
    RecruiterLoginView,
    RecruiterLogoutView,
    JobDetailsView,
    JobSummaryView,
   # CandidateListView,  # New endpoint
)

urlpatterns = [
    path('csrf-token/', get_csrf_token, name='csrf-token'),
    path('login/', RecruiterLoginView.as_view(), name='recruiter-login'),
    path('logout/', RecruiterLogoutView.as_view(), name='recruiter-logout'),
    path('job-details/', JobDetailsView.as_view(), name='job-details'),
    path('job-summary/', JobSummaryView.as_view(), name='job-summary'),
    #path('candidates/', CandidateListView.as_view(), name='candidate-list'),  # New route
]