import React from "react";

function Card({ children, title, ...rest }) {
  return (
    <>
      <div
        style={{
          position: "relative",
          padding: "4rem 2rem",
          borderRadius: "24px",
          boxShadow: "12px 12px 2px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          minWidth: "320px",
          maxWidth: "100%",
        }}
        {...rest}
      >
        {title && (
          <h2
            style={{
              position: "absolute",
              top: "2rem",
              left: 0,
              right: 0,
              margin: 0,
              fontSize: "2rem",
              textAlign: "center",
            }}
          >
            {title}
          </h2>
        )}
        <div style={{ marginTop: title ? "2.25rem" : 0 }}>{children}</div>
      </div>
    </>
  );
}

export default Card;
