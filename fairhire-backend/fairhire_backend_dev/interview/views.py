from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from resume_profiling.models import Candidate
import json

class UpdateCandidateView(APIView):
    def post(self, request):
        data = request.data
        candidate_id = data.get("candidate_id")
        total_score = data.get("total_score")
        skill_scores = data.get("skill_scores", {})  # Dictionary of skill: score pairs
        results = data.get("results", [])  # Q&A details

        # Validate required fields
        if not candidate_id or total_score is None:
            return Response({"error": "Missing required fields: candidate_id or total_score"},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # Update the Candidate table
            candidate = Candidate.objects.get(id=candidate_id)
            candidate.score = total_score
            # Store only skill_scores and results in qadetails
            candidate.qadetails = json.dumps({
                "skill_scores": skill_scores,
                "results": results
            })
            candidate.save()
            return Response({"message": "Candidate updated successfully"}, status=status.HTTP_200_OK)
        except Candidate.DoesNotExist:
            return Response({"error": f"Candidate with ID {candidate_id} not found"},
                            status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CandidateListView(APIView):
    def get(self, request):
        try:
            candidates = Candidate.objects.all()
            candidate_data = [
                {
                    "id": candidate.id,
                    "name": candidate.name,
                    "email": candidate.email,
                    "phone": candidate.phone,
                    "skills": candidate.skills,  # Raw skills string
                    "proctoring_flag": candidate.proctoring_flag,
                    "score": float(candidate.score),  # Convert Decimal to float for JSON
                    "violation_reasons": candidate.violation_reasons,
                    "qadetails": json.loads(candidate.qadetails) if candidate.qadetails else {"skill_scores": {}, "results": []},
            
                }
                for candidate in candidates
            ]
            return Response({"candidates": candidate_data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)