import type { Metadata } from "next"
import TeamManager from "@/components/team-manager"

export const metadata: Metadata = {
  title: "DEADTOOL's Pool League Team Manager",
  description: "Manage your pool league teams and generate valid combinations",
}

export default function Home() {
  // Styles for completely opaque text with high z-index to ensure it's above background
  const titleStyle = {
    opacity: 1,
    color: "#000",
    fontWeight: "bold",
    textShadow: "0 0 5px rgba(255,255,255,0.7)",
    position: "relative",
    zIndex: 20, // Higher z-index to ensure it's above background
  }

  const subtitleStyle = {
    opacity: 1,
    color: "#333",
    fontWeight: "medium",
    textShadow: "0 0 5px rgba(255,255,255,0.7)",
    position: "relative",
    zIndex: 20, // Higher z-index to ensure it's above background
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8" style={{ position: "relative", zIndex: 20 }}>
        <h1 className="text-3xl font-bold mb-2" style={titleStyle}>
          DEADTOOL's Pool League Team Manager
        </h1>
        <p style={subtitleStyle}>
          Manage your teams and generate valid combinations for 8-Ball, 9-Ball, and Double Jeopardy
        </p>
      </div>
      <TeamManager />
    </div>
  )
}
