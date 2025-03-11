import asyncio
import json
import websockets
import google.generativeai as genai
import aiohttp

# Configure the API
API_KEY = "AIzaSyD6qTreN6DozEdKFtPyN4uj1CKWT3c8NnU"  # Replace with an environment variable in production
genai.configure(api_key=API_KEY)

# Define model configuration
generation_config = {
    "temperature": 1.8,
    "top_p": 0.9,
    "top_k": 30,
    "max_output_tokens": 512,
    "response_mime_type": "text/plain",
}

# Create Generative Model
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
    system_instruction=(
        "Act as a human interviewer. Generate questions for the candidate based on the skills and the job title. "
        "When given a job title and a list of skills, first select the most relevant skills from the list that are essential or required for the job title. "
        "Return the selected skills as a list in a clear format like: '[skill1, skill2, skill3]'. "
        "Then, for each skill: start with 2 basic questions. If any basic question scores >= 7, move to 1 intermediate question. "
        "If the intermediate question scores >= 7, ask 1 more intermediate question. If the average of the 2 intermediate scores is >= 7, ask 1 hard question. "
        "After the hard question or if both basic questions score < 7, move to the next skill. Repeat until all skills are covered or the maximum question limit is reached. "
        "Do not generate feedback—just generate the next question. Avoid asking candidates to write code. "
        "The hard questions should be practical-oriented based on earlier theoretical questions. "
        "When scoring an answer, provide a score between 0 and 10 based on accuracy, relevance, and completeness. "
        "Return the score as a single integer (e.g., '8') with no additional text. "
        "For batch scoring, return scores as a list of integers like '[8, 6, 9]' corresponding to the order of question-answer pairs provided."
    ),
)

async def interview_handler(websocket, path=None):
    try:
        websocket.ping_timeout = 120

        data = await websocket.recv()
        interview_data = json.loads(data)

        candidate_id = interview_data.get("candidate_id")
        job_name = interview_data["job_name"]
        max_questions = int(interview_data["num_questions"])
        all_skills = interview_data["skills"]

        print(f"Received job: {job_name}, Candidate ID: {candidate_id}, max questions: {max_questions}, skills: {all_skills}")

        chat_session = model.start_chat(history=[])

        skill_selection_prompt = f"Given the job title '{job_name}' and the skills list {all_skills}, select the most relevant skills required for the role. Return the result as a list like '[skill1, skill2, skill3]'."
        skill_response = chat_session.send_message(skill_selection_prompt)
        selected_skills_text = skill_response.text.strip()

        try:
            selected_skills = json.loads(selected_skills_text.replace("'", '"'))
            if not selected_skills:
                raise ValueError("No relevant skills selected.")
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Skill selection parsing failed: {e}. Using all provided skills.")
            selected_skills = all_skills

        if not selected_skills:
            await websocket.send(json.dumps({"error": "No skills available for the interview."}))
            return

        print(f"Selected skills for {job_name}: {selected_skills}")

        question_count = 0
        skill_index = 0
        scores = []
        completed_skills = set()
        questions_per_skill = {skill: {"basic": [], "intermediate": [], "hard": []} for skill in selected_skills}
        level = "basic"
        SCORE_THRESHOLD = 7

        while question_count < max_questions and len(completed_skills) < len(selected_skills):
            current_skill = selected_skills[skill_index % len(selected_skills)]

            if current_skill in completed_skills:
                skill_index += 1
                continue

            if len(questions_per_skill[current_skill]["basic"]) < 2:
                level = "basic"
            elif len(questions_per_skill[current_skill]["intermediate"]) == 0 and any(
                s["score"] >= SCORE_THRESHOLD for s in scores if s["skill"] == current_skill and s["level"] == "basic"
            ):
                level = "intermediate"
            elif len(questions_per_skill[current_skill]["intermediate"]) == 1:
                if scores[-1]["score"] >= SCORE_THRESHOLD:
                    level = "intermediate"
                else:
                    completed_skills.add(current_skill)
                    skill_index += 1
                    continue
            elif len(questions_per_skill[current_skill]["intermediate"]) == 2:
                intermediate_scores = [s["score"] for s in scores if s["skill"] == current_skill and s["level"] == "intermediate"]
                if sum(intermediate_scores) / 2 >= SCORE_THRESHOLD:
                    level = "hard"
                else:
                    completed_skills.add(current_skill)
                    skill_index += 1
                    continue
            elif len(questions_per_skill[current_skill]["hard"]) == 1:
                completed_skills.add(current_skill)
                skill_index += 1
                continue

            prior_questions = questions_per_skill[current_skill][level]
            prompt = (
                f"Given prior questions for {current_skill}: {prior_questions if prior_questions else 'None'}, "
                f"ask a {level} level question about {current_skill} for the {job_name} role that hasn’t been asked before."
            )
            response = chat_session.send_message(prompt)
            question = response.text.strip()
            questions_per_skill[current_skill][level].append(question)

            await websocket.send(json.dumps({"question": question}))
            print(f"Sent question {question_count + 1}: {question}")

            try:
                try:
                    answer_data = await asyncio.wait_for(websocket.recv(), timeout=120)
                except asyncio.TimeoutError:
                    await websocket.send(json.dumps({"warning": "30 seconds remaining to answer."}))
                    try:
                        answer_data = await asyncio.wait_for(websocket.recv(), timeout=30)
                    except asyncio.TimeoutError:
                        print("Timeout: No response received from candidate after warning.")
                        scores.append({"question": question, "answer": "No response", "score": 0, "skill": current_skill, "level": level})
                        question_count += 1
                        continue

                answer = json.loads(answer_data).get("answer", "").strip()
                print(f"Received answer: {answer}")

                score_prompt = f"Score the following answer to the question '{question}' on a scale of 0 to 10 based on accuracy, relevance, and completeness: '{answer}'. Return the score as a single integer (e.g., '8')."
                score_response = chat_session.send_message(score_prompt)
                score_text = score_response.text.strip()

                try:
                    score = int(score_text)
                    if score < 0 or score > 10:
                        score = 5
                except ValueError:
                    score = 5

                if any(phrase in answer.lower() for phrase in ["i don’t know", "not sure", "no idea"]):
                    if level == "basic":
                        score = 1
                    elif level == "intermediate":
                        score = 4
                    elif level == "hard":
                        score = 6

                scores.append({"question": question, "answer": answer, "score": score, "skill": current_skill, "level": level})
                print(f"Assigned score: {score}")

                question_count += 1

                if level == "basic" and len(questions_per_skill[current_skill]["basic"]) == 2:
                    basic_scores = [s["score"] for s in scores if s["skill"] == current_skill and s["level"] == "basic"]
                    if not any(score >= SCORE_THRESHOLD for score in basic_scores):
                        completed_skills.add(current_skill)
                        skill_index += 1

            except asyncio.TimeoutError:
                print("Unexpected timeout error.")
                break

        # Calculate total and skill-wise scores
        total_raw_score = sum(item["score"] for item in scores)
        max_raw_score = max_questions * 10
        actual_max_raw_score = len(scores) * 10
        final_score = (total_raw_score / actual_max_raw_score) * 100 if actual_max_raw_score > 0 else 0

        skill_scores = {}
        for skill in selected_skills:
            skill_specific_scores = [s["score"] for s in scores if s["skill"] == skill]
            # Convert to percentage out of 10 for consistency with dashboard
            skill_scores[skill] = round((sum(skill_specific_scores) / (len(skill_specific_scores) * 10)) * 100, 2) if skill_specific_scores else 0

        final_output = {
            "status": "Interview Completed" if len(completed_skills) < len(selected_skills) else "All Skills Covered",
            "results": scores,
            "total_raw_score": total_raw_score,
            "max_raw_score": max_raw_score,
            "actual_questions_asked": len(scores),
            "total_score": round(final_score, 2),
            "skill_scores": skill_scores,  # Skill scores as percentages
            "selected_skills": selected_skills,
            "job_name": job_name,
            "candidate_id": candidate_id
        }
        await websocket.send(json.dumps(final_output))
        print("Interview completed successfully. Final output sent:", final_output)

        # Send final_output to Django interviews app endpoint
        async with aiohttp.ClientSession() as session:
            django_url = "http://localhost:8000/interview/update-candidate/"
            async with session.post(django_url, json=final_output) as response:
                if response.status == 200:
                    print("Successfully sent results to Django interviews app")
                else:
                    print(f"Failed to send results to Django interviews app: {response.status}")

    except websockets.exceptions.ConnectionClosed as e:
        print(f"Client disconnected unexpectedly: {e}")
        total_raw_score = sum(item["score"] for item in scores if "score" in item)
        final_score = (total_raw_score / (len(scores) * 10)) * 100 if len(scores) > 0 else 0
        skill_scores = {}
        for skill in selected_skills:
            skill_specific_scores = [s["score"] for s in scores if s["skill"] == skill and "score" in s]
            skill_scores[skill] = round((sum(skill_specific_scores) / (len(skill_specific_scores) * 10)) * 100, 2) if skill_specific_scores else 0

        final_output = {
            "status": "Interview Interrupted",
            "results": scores,
            "total_raw_score": total_raw_score,
            "max_raw_score": max_questions * 10,
            "actual_questions_asked": len(scores),
            "total_score": round(final_score, 2),
            "skill_scores": skill_scores,
            "selected_skills": selected_skills,
            "job_name": job_name,
            "candidate_id": candidate_id
        }
        await websocket.send(json.dumps(final_output))

        async with aiohttp.ClientSession() as session:
            django_url = "http://localhost:8000/interview/update-candidate/"
            async with session.post(django_url, json=final_output) as response:
                if response.status == 200:
                    print("Successfully sent interrupted results to Django interviews app")
                else:
                    print(f"Failed to send interrupted results to Django interviews app: {response.status}")

    except Exception as e:
        print(f"Unexpected server error: {e}")
        await websocket.send(json.dumps({"error": str(e)}))

async def main():
    server = await websockets.serve(
        interview_handler, "localhost", 8765, ping_timeout=120, ping_interval=30
    )
    print("Qgen WebSocket server running on ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())