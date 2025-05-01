"use client"

import type React from "react"

interface CustomTabsTriggerProps {
  value: string
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

export function CustomTabsTrigger({ value, active, disabled, onClick, children }: CustomTabsTriggerProps) {
  // Set background color based on tab value
  let backgroundColor = "#FFFFFF"
  let textColor = "#000000"

  if (value === "teams") {
    backgroundColor = "#00AA00" // Green for Teams tab
    textColor = "#FFFFFF" // White text for contrast
  } else if (value === "editor") {
    backgroundColor = "#0000FF" // Blue for Team Editor tab
    textColor = "#FFFFFF" // White text for contrast
  } else if (value === "combinations") {
    backgroundColor = "#FF0000" // Red for Combinations tab
    textColor = "#FFFFFF" // White text for contrast
  }

  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    borderRadius: "0.25rem",
    padding: "0.375rem 0.75rem",
    fontSize: "0.875rem",
    fontWeight: "bold",
    backgroundColor: backgroundColor,
    color: textColor,
    opacity: 1,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    outline: "none",
    transition: "all 0.2s",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
    filter: disabled ? "grayscale(50%) opacity(0.7)" : "none",
  }

  return (
    <button
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      disabled={disabled}
      style={style}
      onClick={onClick}
    >
      <span style={{ opacity: 1, color: textColor, fontWeight: "bold" }}>{children}</span>
    </button>
  )
}
