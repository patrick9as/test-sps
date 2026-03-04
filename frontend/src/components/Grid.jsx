import React from "react";

function Grid({ items = [], renderItem, keyExtractor = (item) => item.id, ...rest }) {
  if (!items.length) return null;

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1rem",
    padding: 0,
  };

  const cellStyle = { minWidth: 0 };

  return (
    <div style={{ ...gridStyle, ...rest.style }} {...rest}>
      {items.map((item) => (
        <div key={keyExtractor(item)} style={cellStyle}>{renderItem(item)}</div>
      ))}
    </div>
  );
}

export default Grid;
