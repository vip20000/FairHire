# **FairHire - AI-Driven Resume Profiling and Technical Interview Automation System**

## 📌 About FairHire  
FairHire is an AI-powered hiring platform that automates resume profiling, real-time question generation, proctoring, speech analysis, and real-time scoring. It ensures a seamless and unbiased interview experience using advanced AI/ML techniques.

---

## 🚀 **Features**  

- ✅ **Resume Profiling** – Extracts candidate details (name, email, phone number, skills) from resumes in PDF/DOCX format.  
- ✅ **Question Generation** – Dynamically generates skill-based questions in real time using AI models like Gemini.  
- ✅ **Proctoring Module** – Detects malpractice (tab-switching, multiple faces, mobile phone usage) and verifies candidate identity.  
- ✅ **Speech Module** – Converts interview questions to speech and transcribes candidate responses for evaluation.  
- ✅ **Real-Time Scoring** – Evaluates candidate responses using NLP techniques for semantic matching and relevance.  

---

## 🛠️ **Tech Stack**  

### **Frontend**  
- ⚡ React.js (with WebSockets for real-time communication)  

### **Backend**  
- ⚡ Django (REST API)  
- ⚡ WebSockets for real-time communication  

### **Microservices**  
- 🎯 **Resume Profiling**: Python (NLTK, spaCy for NLP processing) _(Implemented as a Python script in the Django app, not a microservice)_  
- 🎯 **Question Generation & Scoring**: Flask/Django with AI-based logic  
- 🎯 **Proctoring**: OpenCV, YOLO (object detection), Mediapipe (face tracking)  
- 🎯 **Speech Processing**: Speech-to-Text and Text-to-Speech (Google API, Whisper, etc.) _(Implemented in the React frontend, not a microservice)_  

### **Database**  
- 🗄️ SQLite (Can be replaced with PostgreSQL/MySQL)  

### **AI/ML Technologies**  
- 🤖 YOLO (Proctoring: object detection)  
- 🤖 NLP (Scoring: semantic matching, question analysis)  
- 🤖 Mediapipe (Face detection and verification)  

---


---

## ⚙️ **Setup & Installation**  

### **1️⃣ Clone the Repository**  

$ git clone https://github.com/yourusername/FairHire.git
$ cd FairHire

### **2️⃣ Setup Virtual Environments for Microservices**
# Resume Profiling
$ cd fairhire-backend/resume_profiling
$ python -m venv resume_env
$ source resume_env/bin/activate  # (Linux/Mac)
$ resume_env\Scripts\activate     # (Windows)
$ pip install -r requirements.txt

# Proctoring
$ cd ../proctoring_service
$ python -m venv proctoring_env
$ source proctoring_env/bin/activate  # (Linux/Mac)
$ proctoring_env\Scripts\activate     # (Windows)
$ pip install -r requirements.txt

# Question Generation & Scoring
$ cd ../qgen_service
$ python -m venv qgen_env
$ source qgen_env/bin/activate  # (Linux/Mac)
$ qgen_env\Scripts\activate     # (Windows)
$ pip install -r requirements.txt

### **3️⃣ Setup Django Backend**
$ cd fairhire-backend/fairhire_backend_dev
$ python -m venv fairhireb_env
$ source fairhireb_env/bin/activate  # (Linux/Mac)
$ fairhireb_env\Scripts\activate     # (Windows)
$ pip install -r requirements.txt
$ python manage.py migrate
$ python manage.py runserver

### **4️⃣ Setup React Frontend**
$ cd ../../fairhire-frontend
$ npm install
$ npm start

---
### **🚀 Running the Entire Project**
Since FairHire has multiple microservices, you need to start them separately:
# Start Resume Profiling Service
$ cd fairhire-backend/resume_profiling
$ source resume_env/bin/activate
$ python resume_service.py

# Start Proctoring Service
$ cd ../proctoring_service
$ source proctoring_env/bin/activate
$ python proctoring_service.py

# Start Question Generation & Scoring Service
$ cd ../qgen_service
$ source qgen_env/bin/activate
$ python qgen_service.py

# Start Django Backend
$ cd ../fairhire_backend_dev
$ source fairhireb_env/bin/activate
$ python manage.py runserver

# Start React Frontend
$ cd ../../fairhire-frontend
$ npm start

---

### **🤝 Contributing**
We welcome contributions! To contribute:

Fork the repository.
Create a new branch (feature-branch).
Make your changes and commit them.
Push to your forked repository.
Create a Pull Request (PR) to the main repository.


### **📧 Contact**
For any queries, feel free to reach out:

📩 Email: fairhire073@gmail.com
