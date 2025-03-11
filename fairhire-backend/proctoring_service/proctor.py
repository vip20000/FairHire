from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np
import mediapipe as mp

# Initialize Flask application
app = Flask(__name__)

# Load YOLO model (pre-trained on COCO dataset)
yolo_model = YOLO('yolov5s.pt')

# Initialize Mediapipe Face Mesh for face detection
face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=False, max_num_faces=5)

# Function to detect faces using Mediapipe
def detect_faces(face_mesh, frame):
    try:
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)
        face_count = 0
        if results.multi_face_landmarks:
            face_count = len(results.multi_face_landmarks)
        return face_count
    except Exception as e:
        print(f"Error in face detection: {e}")
        return 0  # Default to zero faces if detection fails

# Function to detect objects (e.g., phones, laptops) using YOLO
def detect_objects(yolo_model, frame, conf_threshold=0.5):
    try:
        results = yolo_model.predict(frame, conf=conf_threshold)
        for result in results:
            for box in result.boxes:
                cls = int(box.cls[0])
                label = yolo_model.names[cls]
                if label in ['cell phone', 'laptop', 'tablet']:
                    return True  # Detected target device
        return False
    except Exception as e:
        print(f"Error in object detection: {e}")
        return False

@app.route('/proctor', methods=['POST'])
def proctor():
    try:
        # Check if a frame and candidate ID are provided
        if 'frame' not in request.files or 'candidate_id' not in request.form:
            return jsonify({"error": "Invalid request"}), 400

        # Read the image and candidate ID from the request
        file = request.files['frame']
        candidate_id = request.form.get('candidate_id')
        file_bytes = np.frombuffer(file.read(), np.uint8)
        frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Failed to decode image"}), 400

        # Perform proctoring checks
        face_count = detect_faces(face_mesh, frame)
        detected_devices = detect_objects(yolo_model, frame)

        # Determine if any violation occurs
        violation_flag = (face_count == 0 or face_count > 1 or detected_devices)

        # Prepare violation details with boolean flags
        reason = {
            "multiple_persons_detected": face_count > 1,
            "no_person_detected": face_count == 0,
            "device_detected": detected_devices
        }

        # Format the response
        response = {
            "candidate_id": candidate_id,
            "proctoring_flag": violation_flag,
            "reason": reason
        }

        return jsonify(response)

    except Exception as e:
        print(f"Error in /proctor endpoint: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(port=8001)  # Microservice listens on port 8001