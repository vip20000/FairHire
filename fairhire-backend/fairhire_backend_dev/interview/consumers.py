import json
import asyncio
import websockets
from channels.generic.websocket import AsyncWebsocketConsumer

class QGenConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()  # Accept the WebSocket connection
        print("WebSocket connection established with Qgen Consumer")

    async def disconnect(self, close_code):
        print(f"WebSocket connection closed with code {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            candidate_id = data.get("candidate_id")
            job_title = data.get("job_title")
            num_questions = data.get("num_questions")
            skills = data.get("skills")

            print(f"Received interview request: Candidate ID: {candidate_id}, Job Title: {job_title}, Questions: {num_questions}, Skills: {skills}")

            # Forward data to Qgen microservice, including candidate_id
            async with websockets.connect("ws://localhost:8765") as ws:
                await ws.send(json.dumps({
                    "candidate_id": candidate_id,  # Add candidate_id
                    "job_name": job_title,         # Changed to match Qgen's expected key
                    "num_questions": num_questions,
                    "skills": skills,
                }))
                
                while True:
                    response = await ws.recv()
                    response_data = json.loads(response)

                    if "question" in response_data:
                        await self.send(json.dumps({"question": response_data["question"]}))
                    elif "status" in response_data:
                        await self.send(json.dumps({"status": response_data["status"]}))
                        break  # End interview if completed
                    elif "error" in response_data:
                        await self.send(json.dumps({"error": response_data["error"]}))
                        break

        except Exception as e:
            print(f"Error in QGenConsumer: {e}")
            await self.send(json.dumps({"error": str(e)}))