/**
 * Componente Card: container com bordas arredondadas, sombra e título opcional.
 * Usado no login, listagem e modais. Aceita override de padding, borderRadius, minWidth, etc.
 */
import React from "react";

const defaultStyles = {
  position: "relative",
  padding: "4rem 2rem",
  borderRadius: "24px",
  boxShadow: "12px 12px 2px rgba(0,0,0,0.1)",
  backgroundColor: "#fff",
  maxWidth: "100%",
};

const titleStyle = {
  position: "absolute",
  top: "2rem",
  left: 0,
  right: 0,
  margin: 0,
  fontSize: "2rem",
  textAlign: "center",
};

function Card({
  children,
  title,
  padding = defaultStyles.padding,
  borderRadius = defaultStyles.borderRadius,
  boxShadow = defaultStyles.boxShadow,
  backgroundColor = defaultStyles.backgroundColor,
  border,
  minWidth,
  maxWidth = defaultStyles.maxWidth,
  style,
  ...rest
}) {
  const containerStyle = {
    ...defaultStyles,
    padding,
    borderRadius,
    boxShadow,
    backgroundColor,
    ...(minWidth != null && { minWidth }),
    maxWidth,
    ...(border && { border }),
    ...style,
  };

  return (
    <div style={containerStyle} {...rest}>
      {/* Título opcional posicionado no topo do card */}
      {title && <h2 style={titleStyle}>{title}</h2>}
      <div style={{ marginTop: title ? "2.25rem" : 0 }}>{children}</div>
    </div>
  );
}

export default Card;
