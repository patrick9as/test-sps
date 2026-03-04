import React, { useEffect } from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "1rem",
  boxSizing: "border-box",
};

const boxStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  border: "1px solid #ddd",
  maxWidth: "100%",
  maxHeight: "90vh",
  overflow: "auto",
  position: "relative",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 1.25rem",
  borderBottom: "1px solid #eee",
};

const titleStyle = {
  margin: 0,
  fontSize: "1.25rem",
};

const closeButtonStyle = {
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  lineHeight: 1,
  cursor: "pointer",
  padding: "0.25rem",
  color: "#666",
};

const contentStyle = {
  padding: "1.75rem 2rem",
};

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const titleId = "modal-title";

  return (
    <div
      style={overlayStyle}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        style={boxStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <h2 id={titleId} style={titleStyle}>
            {title}
          </h2>
          <button
            type="button"
            style={closeButtonStyle}
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
