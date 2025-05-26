"use client";

import React from "react";

const Progress = ({
  value = 0,
  className = "",
  height = 16,
  backgroundColor = "#e5e7eb",
  fillColor = "#3b82f6",
  showPercentage = false,
  animated = true,
  ...props
}) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: height + "px",
    backgroundColor: backgroundColor,
    borderRadius: height / 2 + "px",
    overflow: "hidden",
    position: "relative",
  };

  const fillStyle: React.CSSProperties = {
    width: clampedValue + "%",
    height: "100%",
    backgroundColor: fillColor,
    transition: animated ? "width 0.3s ease-in-out" : "none",
    borderRadius: "inherit",
  };

  const textStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "12px",
    fontWeight: "500",
    color: "#374151",
    zIndex: 1,
  };

  return (
    <div className={className} style={containerStyle} {...props}>
      <div style={fillStyle} />
      {showPercentage && (
        <span style={textStyle}>{Math.round(clampedValue)}%</span>
      )}
    </div>
  );
};

export { Progress };
