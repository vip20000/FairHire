import asyncio
import websockets
import json

async def test_qgen():
    uri = "ws://localhost:8765"
    
    try:
        async with websockets.connect(uri) as websocket:
            # Send interview request
            interview_data = {
                "job_name": "Data Analyst",
                "num_questions": 10,
                "skills": ["Data Science", "Machine Learning", "NLP", "Deep Learning", "Computer Networks", "Data Structures", "Algorithms"]
            }

            await websocket.send(json.dumps(interview_data))
            print("✅ Sent interview request to Qgen WebSocket server.")

            while True:
                try:
                    # Wait for the server's response
                    response = await asyncio.wait_for(websocket.recv(), timeout=120)
                    data = json.loads(response)

                    if "question" in data:
                        print(f"\n🤖 **Question:** {data['question']}")

                        # Get answer from user input
                        answer = input("👤 Your Answer: ")  # This allows real-time user input

                        await websocket.send(json.dumps({"answer": answer}))
                        print("✅ Answer sent!")

                    elif "status" in data:
                        print("🎉 Interview Completed.")
                        break

                    elif "error" in data:
                        print(f"❌ Error from server: {data['error']}")
                        break

                except asyncio.TimeoutError:
                    print("⚠️ Timeout: No response received from the server.")
                    break

    except websockets.exceptions.ConnectionClosedError as e:
        print(f"❌ Connection closed unexpectedly: {e}")
    except Exception as e:
        print(f"⚠️ Unexpected error: {e}")

# Run the test
asyncio.run(test_qgen())
