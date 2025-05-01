// Import LZ-String for compression
import * as LZString from "lz-string"

// Generate a random string for share IDs
export function generateShareId(): string {
  return Math.random().toString(36).substring(2, 6)
}

// Encode team data into a compact URL-safe string
export function shareTeam(team: any): string {
  try {
    // Create a clean copy of the team to avoid circular references
    const cleanTeam = JSON.parse(JSON.stringify(team))

    // Remove unnecessary properties to reduce size
    const minimalTeam = {
      n: cleanTeam.name,
      g: cleanTeam.gameType || "8-Ball",
      p: cleanTeam.players.map((p: any) => ({
        i: p.id,
        n: p.name,
        e8: p.skillLevel8Ball,
        e9: p.skillLevel9Ball,
        r8: p.required8Ball,
        r9: p.required9Ball,
        a: p.absent,
      })),
    }

    // Convert to JSON and compress using the most reliable method
    const teamData = JSON.stringify(minimalTeam)

    // Use the most compatible compression method
    const compressed = LZString.compressToEncodedURIComponent(teamData)

    // Generate a unique share ID
    const shareId = generateShareId()

    // Return the compact share string
    return `${shareId}${compressed}`
  } catch (error) {
    console.error("Share team error:", error)
    return generateShareId() // Return a share ID anyway to avoid breaking the UI
  }
}

// Decode team data from a URL-safe string
export function getSharedTeam(shareIdWithData: string): any | null {
  try {
    // Extract the compressed data (everything after the first 4 characters)
    const shareId = shareIdWithData.substring(0, 4)
    const compressed = shareIdWithData.substring(4)

    // Try to decompress the data
    let teamData
    try {
      teamData = LZString.decompressFromEncodedURIComponent(compressed)
    } catch (e) {
      console.error("Primary decompression failed:", e)
      // Fallback to alternative decompression method
      try {
        teamData = decodeURIComponent(atob(compressed))
      } catch (e2) {
        console.error("Fallback decompression failed:", e2)
        return null
      }
    }

    if (!teamData) {
      console.error("Decompression returned null or empty string")
      return null
    }

    // Parse the JSON data
    let minimalTeam
    try {
      minimalTeam = JSON.parse(teamData)
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError)
      return null
    }

    // Convert back to full team format
    return {
      id: `shared-${shareId}`,
      name: minimalTeam.n,
      gameType: minimalTeam.g,
      players: minimalTeam.p.map((p: any) => ({
        id: p.i,
        name: p.n,
        skillLevel8Ball: p.e8,
        skillLevel9Ball: p.e9,
        required8Ball: p.r8,
        required9Ball: p.r9,
        absent: p.a,
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
