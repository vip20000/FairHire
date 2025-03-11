from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from resume_profiling.models import Candidate
from django.db import transaction
import requests
import logging

# Configure logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Temporary in-memory store for violation counts per candidate
violation_counts = {}  # Format: {candidate_id: {"multiple_persons_detected": x, "no_person_detected": y, "device_detected": z}}

@csrf_exempt
def proctor_frame(request):
    if request.method == 'POST' and request.FILES.get('frame'):
        try:
            # Extract candidate ID from the request and validate it
            candidate_id_str = request.POST.get('candidate_id')

            # Log the received candidate_id for debugging
            logger.info(f"Received candidate_id (from request): {candidate_id_str}")

            # Check if candidate_id is not 'null' or empty
            if candidate_id_str and candidate_id_str != 'null':
                try:
                    candidate_id = int(candidate_id_str)
                    logger.info(f"Parsed candidate_id: {candidate_id}")
                except ValueError:
                    logger.error(f"Invalid candidate_id format: {candidate_id_str}")
                    return JsonResponse({'error': 'Invalid candidate_id format'}, status=400)
            else:
                logger.error("Candidate ID is missing or invalid.")
                return JsonResponse({'error': 'Candidate ID is missing or invalid'}, status=400)

            # Extract the frame from the request
            frame = request.FILES['frame']
            logger.info("Sending frame to microservice for proctoring...")

            # Send the frame to the proctoring microservice
            response = requests.post(
                'http://127.0.0.1:8001/proctor',  # Microservice endpoint
                files={'frame': frame},
                data={'candidate_id': candidate_id}  # Pass candidate ID
            )

            logger.info(f"Microservice response status: {response.status_code}")
            logger.info(f"Microservice response content: {response.text}")

            # Handle microservice response
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Proctoring data received: {data}")

                # Retrieve the candidate from the database
                try:
                    candidate = Candidate.objects.get(id=candidate_id)
                    logger.info(f"Candidate found: {candidate}")

                    # Initialize violation counts for this candidate if not already present
                    if candidate_id not in violation_counts:
                        violation_counts[candidate_id] = {
                            "multiple_persons_detected": 0,
                            "no_person_detected": 0,
                            "device_detected": 0
                        }

                    # Update the proctoring flag and temporary counts if violation detected
                    if data.get("proctoring_flag", False):
                        logger.warning(f"Violation detected for candidate {candidate_id}. Updating proctoring flag.")
                        candidate.proctoring_flag = True  # Set the flag immediately

                        # Increment temporary counts based on reason
                        reasons = data.get("reason", {})
                        if reasons.get("multiple_persons_detected", False):
                            violation_counts[candidate_id]["multiple_persons_detected"] += 1
                        if reasons.get("no_person_detected", False):
                            violation_counts[candidate_id]["no_person_detected"] += 1
                        if reasons.get("device_detected", False):
                            violation_counts[candidate_id]["device_detected"] += 1

                        with transaction.atomic():
                            candidate.save()  # Save only the proctoring_flag update
                        logger.info(f"Proctoring flag updated for candidate {candidate_id}. Current temp counts: {violation_counts[candidate_id]}")
                    else:
                        logger.info(f"No violations detected for candidate {candidate_id} in this frame")

                    # Return the microservice response as-is for real-time frontend notification
                    return JsonResponse(data)

                except Candidate.DoesNotExist:
                    logger.error(f"Candidate with ID {candidate_id} does not exist.")
                    return JsonResponse({'error': 'Candidate not found'}, status=404)

            logger.error(f"Microservice error: {response.status_code} - {response.text}")
            return JsonResponse({'error': 'Proctoring service error'}, status=500)

        except Exception as e:
            logger.exception(f"Error in processing proctoring data: {e}")
            return JsonResponse({'error': 'Error processing proctoring data'}, status=500)

    logger.error("Invalid request or no frame provided")
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def end_interview(request):
    if request.method == 'POST':
        try:
            candidate_id_str = request.POST.get('candidate_id')
            if candidate_id_str and candidate_id_str != 'null':
                try:
                    candidate_id = int(candidate_id_str)
                    logger.info(f"Ending interview for candidate_id: {candidate_id}")
                except ValueError:
                    logger.error(f"Invalid candidate_id format: {candidate_id_str}")
                    return JsonResponse({'error': 'Invalid candidate_id format'}, status=400)
            else:
                logger.error("Candidate ID is missing or invalid.")
                return JsonResponse({'error': 'Candidate ID is missing or invalid'}, status=400)

            # Retrieve the candidate from the database
            try:
                candidate = Candidate.objects.get(id=candidate_id)
                logger.info(f"Candidate found: {candidate}")

                # Update violation_reasons with accumulated counts
                if candidate_id in violation_counts:
                    candidate.violation_reasons = violation_counts[candidate_id]
                    with transaction.atomic():
                        candidate.save()
                    logger.info(f"Violation reasons updated for candidate {candidate_id}: {candidate.violation_reasons}")

                    # Clear the temporary counts for this candidate
                    del violation_counts[candidate_id]
                    logger.info(f"Temporary counts cleared for candidate {candidate_id}")

                return JsonResponse({'status': 'success', 'message': 'Interview ended and violations recorded'})

            except Candidate.DoesNotExist:
                logger.error(f"Candidate with ID {candidate_id} does not exist.")
                return JsonResponse({'error': 'Candidate not found'}, status=404)

        except Exception as e:
            logger.exception(f"Error in ending interview: {e}")
            return JsonResponse({'error': 'Error processing interview end'}, status=500)

    logger.error("Invalid request for ending interview")
    return JsonResponse({'error': 'Invalid request'}, status=400)