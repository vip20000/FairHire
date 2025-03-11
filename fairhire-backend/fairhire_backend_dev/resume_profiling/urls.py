from django.urls import path
from .views import CandidateUploadView, CandidateSkillsView

urlpatterns = [
    path('upload_resume/', CandidateUploadView.as_view(), name='upload_resume'),
    path('candidate_skills/', CandidateSkillsView.as_view(), name='get_candidate_skills'),
    

]
