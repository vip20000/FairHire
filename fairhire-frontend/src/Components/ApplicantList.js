import React, { useState, useEffect } from "react";
import CandidateProfile from "./CandidateProfile"; // Replace ApplicantDetails with CandidateProfile

const ApplicantList = ({ csrfToken }) => {
    const [applicants, setApplicants] = useState([]);
    const [activeApplicant, setActiveApplicant] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                // Updated to match dashboard's endpoint for consistency
                const response = await fetch("http://127.0.0.1:8000/interview/candidates/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    credentials: "include",
                });
                if (!response.ok) throw new Error("Failed to fetch applicants");
                const data = await response.json();
                setApplicants(data.candidates || []);
            } catch (error) {
                console.error("Error fetching applicants:", error);
                setAlertMessage("Failed to load applicant data.");
            }
        };
        if (csrfToken) fetchApplicants();
    }, [csrfToken]);

    const filteredApplicants = applicants
        .filter(applicant => 
            applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "date" && a.date && b.date) return new Date(b.date) - new Date(a.date);
            if (sortBy === "score") return (b.score || 0) - (a.score || 0);
            return 0;
        });

    const styles = {
        container: {
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "20px",
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            gap: "20px",
        },
        h2: {
            color: "#0277bd",
            fontWeight: "500",
            fontSize: "28px",
            letterSpacing: "0.5px",
            margin: "0",
            whiteSpace: "nowrap",
        },
        controls: {
            display: "flex",
            gap: "20px",
            flex: "1",
            justifyContent: "flex-end",
        },
        input: {
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #e0e0e0",
            fontSize: "14px",
            width: "300px",
        },
        select: {
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #e0e0e0",
            fontSize: "14px",
        },
        applicantList: {
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            padding: "15px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
        },
        applicantItem: {
            flex: "1 1 400px",
            maxWidth: "450px",
            padding: "15px 20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        applicantItemHover: {
            backgroundColor: "#f0f8ff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        },
        applicantInfo: {
            display: "flex",
            flexDirection: "column",
            gap: "5px",
        },
        applicantName: {
            fontWeight: "600",
            fontSize: "18px",
            color: "#333",
        },
        applicantScore: {
            fontSize: "14px",
            color: "#666",
        },
        toggleIcon: {
            fontSize: "24px",
            color: "#0288d1",
            fontWeight: "bold",
            paddingLeft: "15px",
        },
        error: {
            color: "#d32f2f",
            marginTop: "20px",
            textAlign: "center",
            fontSize: "14px",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.h2}>Interview Results</h2>
                <div style={styles.controls}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        style={styles.select}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="date">Sort by Date</option>
                        <option value="score">Sort by Score</option>
                    </select>
                </div>
            </div>
            <div style={styles.applicantList}>
                {filteredApplicants.map((applicant) => (
                    <div
                        key={applicant.id}
                        style={styles.applicantItem}
                        onClick={() => setActiveApplicant(applicant)}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.applicantItemHover)}
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.applicantItem)}
                    >
                        <div style={styles.applicantInfo}>
                            <span style={styles.applicantName}>{applicant.name}</span>
                            {applicant.score && (
                                <span style={styles.applicantScore}>
                                    Score: {applicant.score}
                                </span>
                            )}
                        </div>
                        <span style={styles.toggleIcon}>+</span>
                    </div>
                ))}
            </div>
            {alertMessage && <p style={styles.error}>{alertMessage}</p>}
            {activeApplicant && (
                <CandidateProfile 
                    applicant={activeApplicant} 
                    onClose={() => setActiveApplicant(null)} 
                />
            )}
        </div>
    );
};

export default ApplicantList;