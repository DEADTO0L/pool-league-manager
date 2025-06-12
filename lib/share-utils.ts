// Encode team data into an extremely compact string
export function shareTeam(team: any): string {
  try {
    // Create a clean copy of the team to avoid circular references
    const cleanTeam = JSON.parse(JSON.stringify(team))

    // Create an ultra-minimal team object with shortest possible property names
    // and only the absolutely essential data
    const minimalTeam = {
      // Single letter keys to minimize size
      n: cleanTeam.name,
      g: cleanTeam.gameType ? cleanTeam.gameType.charAt(0) : "8", // Just use first letter: 8, 9, or D
      p: cleanTeam.players.map((p: any) => [
        // Use array instead of object with named properties
        p.name,
        p.skillLevel8Ball || 0,
        p.skillLevel9Ball || 0,
      ]),
    }

    // Convert to JSON and remove all unnecessary whitespace
    const teamData = JSON.stringify(minimalTeam)

    // Use direct URI encoding instead of base64 for shorter strings
    // This is not secure but the user specified security isn't needed
    return encodeURIComponent(teamData)
  } catch (error) {
    console.error("Share team error:", error)
    return "error" // Return a simple error indicator
  }
}

// Decode team data from a compact string
export function getSharedTeam(shareData: string): any | null {
  try {
    // Decode the URI component
    const teamData = decodeURIComponent(shareData)

    // Parse the JSON data
    const minimalTeam = JSON.parse(teamData)

    // Convert game type back from single letter
    let gameType = "8-Ball"
    if (minimalTeam.g === "9") {
      gameType = "9-Ball"
    } else if (minimalTeam.g === "D") {
      gameType = "Double-Jeopardy"
    }

    // Convert back to full team format
    return {
      id: `shared-${Date.now()}`,
      name: minimalTeam.n,
      gameType: gameType,
      players: minimalTeam.p.map((p: any, index: number) => ({
        id: `shared-player-${index}`,
        name: p[0],
        skillLevel8Ball: p[1],
        skillLevel9Ball: p[2],
        // Set defaults for the fields we're no longer sharing
        required8Ball: false,
        required9Ball: false,
        absent: false,
      })),
    }
  } catch (e) {
    console.error("Error getting shared team:", e)
    return null
  }
}

// This function is kept for backward compatibility but is no longer used
export function getAllSharedTeams(): Record<string, any> {
  return {}
}

// Generate a random string for share IDs - no longer used but kept for compatibility
export function generateShareId(): string {
  return Math.random().toString(36).substring(2, 6)
}
