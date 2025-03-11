from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Candidate
from .resume_parser import parse_resume

class CandidateUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('resume')
        if not file:
            return JsonResponse({'status': 'error', 'message': 'No file provided'}, status=400)

        # Save the file temporarily
        file_path = f'{file.name}'
        with open(file_path, 'wb') as f:
            for chunk in file.chunks():
                f.write(chunk)

        try:
            # Parse the resume
            resume_data = parse_resume(file_path)

            name = resume_data.get("Name", "Unknown")
            email = resume_data.get("Email", "Unknown")
            phone = resume_data.get("Phone", "Unknown")
            skills = ', '.join(resume_data.get("Skills", []))

            # Save to the database
            candidate = Candidate(name=name, email=email, phone=phone, skills=skills)
            candidate.save()

            candidate_details = {
                'id': candidate.id,
                'name': candidate.name,
                'email': candidate.email,
                'phone': candidate.phone,
            }

            return JsonResponse({'status': 'success', 'message': 'Resume processed successfully!', 'candidate_details': candidate_details}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

class CandidateSkillsView(APIView):
    def get(self, request, *args, **kwargs):
        candidate_id = request.GET.get('candidate_id')
        if not candidate_id:
            return JsonResponse({'status': 'error', 'message': 'Candidate ID is required'}, status=400)

        try:
            candidate = Candidate.objects.get(id=candidate_id)
            skills = candidate.skills.split(', ') if candidate.skills else []
            return JsonResponse({'status': 'success', 'skills': skills}, status=200)
        except Candidate.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Candidate not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
