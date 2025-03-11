from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.middleware.csrf import get_token
from .models import JobDetails
from .serializers import JobDetailsSerializer
from resume_profiling.models import Candidate  # Import Candidate model
from resume_profiling.serializers import CandidateSerializer  # Import Candidate serializer
import json

# Hardcoded recruiter credentials
RECRUITER_USERNAME = "recruiter"
RECRUITER_PASSWORD = "password123"

# Endpoint to get CSRF token
@csrf_exempt
def get_csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})

@method_decorator(csrf_exempt, name='dispatch')
class RecruiterLoginView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body.decode('utf-8'))
            username = data.get("username")
            password = data.get("password")

            if username == RECRUITER_USERNAME and password == RECRUITER_PASSWORD:
                request.session["recruiter_authenticated"] = True
                request.session.modified = True
                return JsonResponse({"status": "success", "message": "Login successful"}, status=200)
            else:
                return JsonResponse({"status": "error", "message": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class RecruiterLogoutView(View):
    def post(self, request, *args, **kwargs):
        try:
            request.session.flush()
            return JsonResponse({"status": "success", "message": "Logged out successfully"}, status=200)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class JobDetailsView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body.decode('utf-8'))
            job_name = data.get("job_name")
            job_description = data.get("job_description")
            num_questions = data.get("num_questions")
            job_code = data.get("job_code")

            if not all([job_name, job_description, num_questions, job_code]):
                return JsonResponse({"status": "error", "message": "All fields are required"}, status=400)

            if JobDetails.objects.filter(job_code=job_code).exists():
                return JsonResponse({"status": "error", "message": "Job code already exists. Please enter a unique code."}, status=400)

            job = JobDetails.objects.create(
                job_name=job_name,
                job_description=job_description,
                num_questions=num_questions,
                job_code=job_code
            )
            return JsonResponse({"status": "success", "message": "Job details saved successfully", "job_id": job.id}, status=201)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    def get(self, request, *args, **kwargs):
        try:
            job_code = request.GET.get("job_code")
            if not job_code:
                return JsonResponse({"status": "error", "message": "Job code is required"}, status=400)

            job = JobDetails.objects.filter(job_code=job_code).first()
            if not job:
                return JsonResponse({"status": "error", "message": "Job not found"}, status=404)

            serializer = JobDetailsSerializer(job, many=False)
            return JsonResponse({"status": "success", "data": serializer.data}, status=200)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class JobSummaryView(View):
    def get(self, request, *args, **kwargs):
        try:
            job_code = request.GET.get("job_code")
            if not job_code:
                return JsonResponse({"status": "error", "message": "Job code is required"}, status=400)

            job = JobDetails.objects.filter(job_code=job_code).first()
            if not job:
                return JsonResponse({"status": "error", "message": "Job not found"}, status=404)

            job_summary = {
                "job_name": job.job_name,
                "num_questions": job.num_questions
            }
            return JsonResponse({"status": "success", "data": job_summary}, status=200)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
"""
@method_decorator(csrf_exempt, name='dispatch')
class CandidateListView(View):
    def get(self, request, *args, **kwargs):
        try:
            # Fetch all candidates from the resume_profiling app
            candidates = Candidate.objects.all()
            serializer = CandidateSerializer(candidates, many=True)
            return JsonResponse({"status": "success", "candidates": serializer.data}, status=200)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
"""

            