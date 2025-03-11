import React from "react";
import jsPDF from "jspdf"; // Install with: npm install jspdf

const CandidateProfile = ({ applicant, onClose }) => {
    // Parse qadetails if it's a string
    const qadetails = typeof applicant.qadetails === "string" ? JSON.parse(applicant.qadetails) : applicant.qadetails;
    const skillScores = qadetails?.skill_scores || {};
    const results = qadetails?.results || [];

    console.log("Skill Scores:", skillScores);
    console.log("Results:", results);

    // Calculate interview details from results
    const totalQuestions = results.length;
    const questionsBySkill = results.reduce((acc, { skill }) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
    }, {});
    const scoresBySkill = results.reduce((acc, { skill, score }) => {
        acc[skill] = acc[skill] || { total: 0, count: 0 };
        acc[skill].total += score;
        acc[skill].count += 1;
        return acc;
    }, {});
    const averageScoresBySkill = Object.fromEntries(
        Object.entries(scoresBySkill).map(([skill, { total, count }]) => [skill, (total / count).toFixed(2)])
    );

    const styles = {
        modal: {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000",
        },
        profileSection: {
            background: "#fff",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
            width: "80%",
            maxWidth: "900px",
            maxHeight: "90vh",
            overflowY: "auto",
        },
        profileHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            borderBottom: "2px solid #e0e0e0",
            paddingBottom: "10px",
        },
        profileTitle: {
            fontSize: "26px",
            color: "#0277bd",
            fontWeight: "700",
        },
        closeButton: {
            fontSize: "24px",
            color: "#888",
            cursor: "pointer",
            transition: "color 0.2s",
        },
        closeButtonHover: {
            color: "#d32f2f", // Added hover color
        },
        exportButton: {
            padding: "8px 16px",
            background: "#0277bd",
            color: "#fff",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            marginLeft: "10px",
        },
        profileDetails: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "25px",
        },
        detailItem: {
            marginBottom: "20px",
        },
        detailLabel: {
            fontSize: "15px",
            color: "#555",
            fontWeight: "600",
            marginBottom: "5px",
        },
        detailValue: {
            fontSize: "17px",
            color: "#333",
            wordBreak: "break-word",
            background: "#f5f5f5",
            padding: "8px",
            borderRadius: "6px",
        },
        scoreContainer: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
        },
        scoreBar: {
            height: "20px",
            background: "linear-gradient(to right, #0277bd, #4caf50)",
            borderRadius: "4px",
            transition: "width 0.5s ease",
        },
        proctoringFlag: {
            padding: "6px 12px",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "500",
            display: "inline-block",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        violationChart: {
            marginTop: "10px",
            padding: "10px",
            background: "#fff",
            borderRadius: "6px",
        },
        violationContainer: {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
        },
        violationBar: {
            height: "20px",
            background: "linear-gradient(to right, #d32f2f, #ff6655)",
            borderRadius: "4px",
            position: "relative",
            transition: "width 0.5s ease",
        },
        violationLabel: {
            fontSize: "14px",
            color: "#333",
            marginBottom: "5px",
        },
        violationValue: {
            position: "absolute",
            right: "5px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "12px",
            color: "#fff",
            fontWeight: "bold",
        },
        skillChart: {
            marginTop: "25px",
            padding: "20px",
            background: "#f9f9f9",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        },
        chartTitle: {
            fontSize: "20px",
            color: "#0277bd",
            marginBottom: "15px",
            textAlign: "center",
            fontWeight: "600",
        },
        barContainer: {
            display: "flex",
            alignItems: "flex-end",
            height: "250px",
            gap: "15px",
            position: "relative",
        },
        bar: {
            flex: 1,
            background: "linear-gradient(to top, #0277bd, #4fc3f7)",
            borderRadius: "6px 6px 0 0",
            position: "relative",
            transition: "height 0.5s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        barLabel: {
            position: "absolute",
            bottom: "-25px",
            width: "100%",
            textAlign: "center",
            fontSize: "13px",
            color: "#333",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
        barValue: {
            position: "absolute",
            top: "-25px",
            width: "100%",
            textAlign: "center",
            fontSize: "14px",
            color: "#0277bd",
            fontWeight: "bold",
            background: "rgba(255,255,255,0.8)",
            padding: "2px 6px",
            borderRadius: "4px",
        },
        interviewDetails: {
            marginTop: "25px",
            padding: "20px",
            background: "#f9f9f9",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        },
        detailList: {
            listStyle: "none",
            padding: "0",
            margin: "0",
        },
        detailListItem: {
            fontSize: "15px",
            color: "#333",
            marginBottom: "10px",
        },
    };

    const getProctoringStyle = (flag) => ({
        ...styles.proctoringFlag,
        backgroundColor: flag ? "#d32f2f" : "#4caf50",
    });

    const renderSkillChart = (skills) => {
        const maxScore = 100; // Assuming scores are percentages
        if (Object.keys(skills).length === 0) {
            return (
                <div style={styles.skillChart}>
                    <div style={styles.chartTitle}>Skill Performance</div>
                    <div style={{ textAlign: "center", color: "#666", fontSize: "16px", padding: "20px" }}>
                        No skill scores available
                    </div>
                </div>
            );
        }
        return (
            <div style={styles.skillChart}>
                <div style={styles.chartTitle}>Skill Performance</div>
                <div style={styles.barContainer}>
                    {Object.entries(skills).map(([skill, score]) => (
                        <div
                            key={skill}
                            style={{
                                ...styles.bar,
                                height: `${(score / maxScore) * 100}%`,
                                opacity: score === 0 ? 0.3 : 1,
                            }}
                        >
                            <span style={styles.barValue}>{score}%</span>
                            <span style={styles.barLabel}>{skill}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderViolationChart = (violations) => {
        const maxCount = Math.max(...Object.values(violations), 5);
        return (
            <div style={styles.violationChart}>
                <div style={styles.violationContainer}>
                    {Object.entries(violations).map(([reason, count]) => (
                        count > 0 && (
                            <div key={reason}>
                                <div style={styles.violationLabel}>
                                    {reason.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div
                                    style={{
                                        ...styles.violationBar,
                                        width: `${(count / maxCount) * 100}%`,
                                    }}
                                >
                                    <span style={styles.violationValue}>{count}</span>
                                </div>
                            </div>
                        )
                    ))}
                    {Object.values(violations).every(v => v === 0) && (
                        <div style={{ ...styles.violationLabel, color: "#4caf50", textAlign: "center" }}>
                            No Violations Detected
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`${applicant.name}'s Profile`, 20, 20);
        doc.setFontSize(12);
        doc.text(`Email: ${applicant.email}`, 20, 30);
        doc.text(`Phone: ${applicant.phone}`, 20, 40);
        doc.text(`Score: ${applicant.score || "N/A"}`, 20, 50);
        doc.text(`Proctoring Status: ${applicant.proctoring_flag ? "Violations Detected" : "No Violations"}`, 20, 60);
        doc.text(`Skills: ${applicant.skills}`, 20, 70);

        let y = 80;
        doc.text("Violation Reasons:", 20, y);
        y += 10;
        const violations = Object.entries(applicant.violation_reasons)
            .filter(([_, count]) => count > 0)
            .map(([reason, count]) => `${reason.replace(/([A-Z])/g, ' $1').trim()}: ${count}`);
        if (violations.length === 0) {
            doc.text("None", 20, y);
            y += 10;
        } else {
            violations.forEach((violation) => {
                doc.text(violation, 20, y);
                y += 10;
            });
        }

        doc.text("Skill Scores:", 20, y);
        y += 10;
        Object.entries(skillScores).forEach(([skill, score]) => {
            doc.text(`${skill}: ${score}%`, 20, y);
            y += 10;
        });

        doc.text("Interview Details:", 20, y);
        y += 10;
        doc.text(`Total Questions Asked: ${totalQuestions}`, 20, y);
        y += 10;
        Object.entries(questionsBySkill).forEach(([skill, count]) => {
            doc.text(`Questions on ${skill}: ${count}`, 20, y);
            y += 10;
        });
        Object.entries(averageScoresBySkill).forEach(([skill, avgScore]) => {
            doc.text(`Average Score on ${skill}: ${avgScore}`, 20, y);
            y += 10;
        });

        doc.save(`${applicant.name}_Profile.pdf`);
    };

    return (
        <div style={styles.modal}>
            <div style={styles.profileSection}>
                <div style={styles.profileHeader}>
                    <h2 style={styles.profileTitle}>{applicant.name}'s Profile</h2>
                    <div>
                        <button style={styles.exportButton} onClick={exportToPDF}>
                            Export to PDF
                        </button>
                        <span
                            style={styles.closeButton}
                            onClick={onClose}
                            onMouseEnter={(e) => (e.currentTarget.style.color = styles.closeButtonHover.color)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = styles.closeButton.color)}
                        >
                            ✕
                        </span>
                    </div>
                </div>
                <div style={styles.profileDetails}>
                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Email</span>
                        <div style={styles.detailValue}>{applicant.email}</div>
                    </div>
                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Phone</span>
                        <div style={styles.detailValue}>{applicant.phone}</div>
                    </div>
                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Score</span>
                        <div style={styles.scoreContainer}>
                            <div style={styles.detailValue}>{applicant.score || "N/A"}</div>
                            {applicant.score && (
                                <div style={{ ...styles.scoreBar, width: `${applicant.score}%` }} />
                            )}
                        </div>
                    </div>
                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Proctoring Status</span>
                        <div style={getProctoringStyle(applicant.proctoring_flag)}>
                            {applicant.proctoring_flag ? "Violations Detected" : "No Violations"}
                        </div>
                    </div>
                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Skills</span>
                        <div style={styles.detailValue}>{applicant.skills}</div>
                    </div>
                    <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Violation Reasons</span>
                        {renderViolationChart(applicant.violation_reasons)}
                    </div>
                </div>
                {renderSkillChart(skillScores)}
                <div style={styles.interviewDetails}>
                    <div style={styles.chartTitle}>Interview Details</div>
                    <ul style={styles.detailList}>
                        <li style={styles.detailListItem}>Total Questions Asked: {totalQuestions}</li>
                        {Object.entries(questionsBySkill).map(([skill, count]) => (
                            <li key={skill} style={styles.detailListItem}>
                                Questions on {skill}: {count}
                            </li>
                        ))}
                        {Object.entries(averageScoresBySkill).map(([skill, avgScore]) => (
                            <li key={skill} style={styles.detailListItem}>
                                Average Score on {skill}: {avgScore}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CandidateProfile;