import React from "react";

function Card({ children, title, ...rest }) {
  return (
    <div
      style={{
        padding: "1.5rem 2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        minWidth: "320px",
        maxWidth: "100%",
      }}
      {...rest}
    >
      {title && (
        <h2 style={{ marginTop: 0, marginBottom: "1.25rem", fontSize: "1.25rem" }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export default Card;
