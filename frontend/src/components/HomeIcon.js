import React from "react";
import { useNavigate } from "react-router-dom";

function HomeIcon({ text = "Go Home" }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "absolute",
        top: "20px", // Distance from the top
        right: "20px", // Move to the right side
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "8px 12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
      onClick={() => navigate("/")}
    >
      <span role="img" aria-label="home-icon" style={{ fontSize: "1.5rem" }}>
        🏠
      </span>
      <span style={{ fontWeight: "bold", fontSize: "1rem" }}>{text}</span>
    </div>
  );
}

export default HomeIcon;
