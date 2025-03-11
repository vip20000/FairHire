import re
import pdfplumber
import spacy
import docx

# Load the NLP model for name detection (spaCy)
nlp = spacy.load("en_core_web_sm")

# Updated predefined list of skills
skills_list = [
    # Programming Languages
    "Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript", "R", "Scala", 
    "Swift", "Kotlin", "Go", "Ruby", "PHP", "MATLAB", "SQL", "Shell Scripting", 
    "Bash", "PowerShell", "Perl",
    
    # Data Science & Analytics
    "Data Analysis", "Machine Learning", "Deep Learning", "Artificial Intelligence (AI)", 
    "Natural Language Processing (NLP)", "Predictive Analytics", "Statistical Modeling", 
    "Big Data Analytics", "Data Wrangling", "Data Visualization", "Time Series Analysis", 
    "Reinforcement Learning", "Computer Vision",
    
    # Data Science Tools & Libraries
    "Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-learn", "TensorFlow", 
    "PyTorch", "Keras", "Jupyter Notebook", "Apache Spark", "Hadoop Ecosystem", 
    "HDFS", "Hive", "Pig", "Mahout", "Tableau", "Power BI", "D3.js", "SAS", 
    "KNIME", "RapidMiner", "Orange",
    
    # Databases
    "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Cassandra", "DynamoDB", "Redis", 
    "Elasticsearch", "Oracle Database", "Snowflake", "Google BigQuery",
    
    # Cloud Computing
    "Amazon Web Services (AWS)", "Microsoft Azure", "Google Cloud Platform (GCP)", 
    "IBM Cloud", "Oracle Cloud", "Docker", "Kubernetes", "OpenShift", "Terraform", 
    "Ansible", "CloudFormation", "Jenkins", "VMware", "Hyper-V",
    
    # Web Development
    "HTML", "CSS", "JavaScript", "React.js", "Angular", "Vue.js", "SASS", "LESS", 
    "Bootstrap", "jQuery", "TypeScript", "Node.js", "Express.js", "Django", 
    "Flask", "Ruby on Rails", "Spring Framework", "ASP.NET", "Laravel",
    
    # Full-Stack Development
    "MERN Stack", "MEAN Stack", "LAMP Stack",
    
    # Mobile App Development
    "Android (Java, Kotlin)", "iOS (Swift, Objective-C)", "React Native", "Flutter", 
    "Xamarin", "Apache Cordova", "Ionic",
    
    # DevOps & Automation
    "Git", "GitHub", "GitLab", "Bitbucket", "Jenkins", "Travis CI", "CircleCI", 
    "Docker", "Kubernetes", "Terraform", "Ansible", "Nagios", "Prometheus", 
    "Splunk", "Puppet",
    
    # Operating Systems & Virtualization
    "Linux", "Ubuntu", "CentOS", "Red Hat", "Debian", "Windows Server", "macOS", 
    "VMware vSphere", "Docker Swarm", "VirtualBox", "Hyper-V",
    
    # Networking & Cybersecurity
    "TCP/IP", "DNS", "DHCP", "VPN", "Firewalls", "Penetration Testing", 
    "Ethical Hacking", "Network Administration", "Cybersecurity Tools", 
    "Nmap", "Wireshark", "Metasploit", "ISO 27001", "NIST", "SOC 2", 
    "Endpoint Security", "SIEM Tools", "Splunk", "LogRhythm", "IBM QRadar",
    
    # Collaboration & Project Management
    "Jira", "Trello", "Asana", "Slack", "Microsoft Teams", "Zoom", 
    "Google Workspace", "Docs", "Sheets", "Slides", "Monday.com", "Confluence",
    
    # Software Testing & QA
    "Selenium", "Appium", "JMeter", "TestNG", "Cypress", "Postman", 
    "SoapUI", "LoadRunner", "HP ALM", "Bugzilla",
    
    # Data Engineering
    "Apache Kafka", "Apache Airflow", "Apache NiFi", "Databricks", "AWS Glue", 
    "Snowflake", "Azure Synapse Analytics", "ETL Processes",
    
    # AI & Machine Learning Platforms
    "Google AI Platform", "Microsoft Azure ML Studio", "AWS SageMaker", 
    "IBM Watson", "OpenAI", "GPT Models", "Hugging Face",
    
    # Soft Skills
    "Problem Solving", "Critical Thinking", "Communication Skills", 
    "Leadership", "Teamwork", "Agile Methodology", "Time Management",
    
    # Emerging Technologies
    "Blockchain", "Ethereum", "Solidity", "Internet of Things (IoT)", 
    "Quantum Computing", "Augmented Reality (AR)", "Virtual Reality (VR)", 
    "Edge Computing",
    
    # Others
    "ERP Systems", "SAP", "Oracle ERP", "CRM Tools", "Salesforce", "HubSpot", 
    "Digital Marketing Tools", "Google Analytics", "SEO", "SEM", 
    "Graphic Design Tools", "Adobe Photoshop", "Illustrator", "InDesign", 
    "UX/UI Tools", "Figma", "Sketch", "Adobe XD"
]

def extract_name(text):
    """
    Extracts the candidate's name based on the assumption that
    the name is typically the first highlighted or standalone text in the resume.
    """
    lines = text.split("\n")
    for line in lines[:5]:  # Look at the first 5 lines
        line = line.strip()
        if line and re.match(r"^[A-Za-z ]+$", line):  # Simple check for a valid name
            return line.title()
    return "Name not found"

def extract_contact_info(text):
    """
    Extracts email and phone number from the resume text.
    """
    # Extract email
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    email = email_match.group() if email_match else "Email not found"

    # Extract phone number
    phone_match = re.search(r"\+?\d[\d -]{8,}\d", text)  # Matches various phone number formats
    phone = phone_match.group() if phone_match else "Phone number not found"

    return email, phone

def extract_skills(text, skills_list):
    """
    Matches skills from the predefined skills_list within the resume text.
    """
    detected_skills = set()
    for skill in skills_list:
        if re.search(rf"\b{re.escape(skill)}\b", text, re.IGNORECASE):
            detected_skills.add(skill)
    return list(detected_skills)

def parse_pdf(file_path):
    """
    Parses a resume PDF to extract name, contact information, and skills.
    """
    with pdfplumber.open(file_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()

    # Extract personal information
    name = extract_name(text)
    email, phone = extract_contact_info(text)
    skills = extract_skills(text, skills_list)

    return {
        "Name": name,
        "Email": email,
        "Phone": phone,
        "Skills": skills
    }

def parse_docx(file_path):
    """
    Parses a resume DOCX to extract name, contact information, and skills.
    """
    doc = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"

    # Extract personal information
    name = extract_name(text)
    email, phone = extract_contact_info(text)
    skills = extract_skills(text, skills_list)

    return {
        "Name": name,
        "Email": email,
        "Phone": phone,
        "Skills": skills
    }

def parse_txt(file_path):
    """
    Parses a resume TXT file to extract name, contact information, and skills.
    """
    with open(file_path, "r") as file:
        text = file.read()

    # Extract personal information
    name = extract_name(text)
    email, phone = extract_contact_info(text)
    skills = extract_skills(text, skills_list)

    return {
        "Name": name,
        "Email": email,
        "Phone": phone,
        "Skills": skills
    }

def parse_resume(file_path):
    """
    Determines the file type and calls the respective parser function.
    """
    if file_path.endswith('.pdf'):
        return parse_pdf(file_path)
    elif file_path.endswith('.docx'):
        return parse_docx(file_path)
    elif file_path.endswith('.txt'):
        return parse_txt(file_path)
    else:
        raise ValueError("Unsupported file type")

