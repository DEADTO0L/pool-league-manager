"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Player {
  id: string
  name: string
  score: number
  colorIndex: number
}

// Array of muted, distinct colors for player backgrounds
const playerColors = [
  "bg-slate-200", // Slate
  "bg-stone-200", // Stone
  "bg-red-100", // Red (muted)
  "bg-amber-100", // Amber (muted)
  "bg-lime-100", // Lime (muted)
  "bg-emerald-100", // Emerald (muted)
  "bg-cyan-100", // Cyan (muted)
  "bg-blue-100", // Blue (muted)
  "bg-violet-100", // Violet (muted)
  "bg-fuchsia-100", // Fuchsia (muted)
  "bg-rose-100", // Rose (muted)
  "bg-orange-100", // Orange (muted)
]

// Local storage key for saving scorekeeper data
const STORAGE_KEY = "poolLeagueScorekeeper"

export default function CustomGameScorekeeper() {
  const [players, setPlayers] = useState<Player[]>([])
  const { toast } = useToast()
  const nextPlayerNumber = useRef(2)
  const nextColorIndex = useRef(1)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Load saved players from localStorage on component mount
  useEffect(() => {
    if (hasInitialized) return // Prevent multiple initializations

    try {
      const savedData = localStorage.getItem(STORAGE_KEY)

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)

          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setPlayers(parsedData)

            // Update the refs based on saved data
            const maxPlayerNumber = Math.max(
              ...parsedData.map((p) => {
                const match = p.name.match(/Player (\d+)/)
                return match ? Number.parseInt(match[1], 10) : 0
              }),
            )
            nextPlayerNumber.current = Math.max(maxPlayerNumber + 1, 2)

            // Find the highest color index and increment for next player
            const maxColorIndex = Math.max(...parsedData.map((p) => p.colorIndex))
            nextColorIndex.current = (maxColorIndex + 1) % playerColors.length
          } else {
            // Initialize with default player if no valid data
            setPlayers([{ id: "1", name: "Player 1", score: 0, colorIndex: 0 }])
          }
        } catch (parseError) {
          console.error("Failed to parse saved scorekeeper data:", parseError)
          setPlayers([{ id: "1", name: "Player 1", score: 0, colorIndex: 0 }])
        }
      } else {
        // Initialize with default player if no saved data
        setPlayers([{ id: "1", name: "Player 1", score: 0, colorIndex: 0 }])
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e)
      // Fallback to default player if localStorage is not available
      setPlayers([{ id: "1", name: "Player 1", score: 0, colorIndex: 0 }])
    } finally {
      setHasInitialized(true)
    }
  }, [hasInitialized])

  // Save players to localStorage whenever they change
  useEffect(() => {
    if (!hasInitialized) return // Don't save until initial load is complete

    try {
      // Create a clean copy to avoid circular references
      const cleanPlayers = JSON.parse(JSON.stringify(players))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanPlayers))
    } catch (e) {
      console.error("Failed to save scorekeeper data to localStorage:", e)

      // Show a toast notification if saving fails
      toast({
        title: "Storage Error",
        description: "Failed to save scores. Your browser may have limited storage.",
        variant: "destructive",
      })
    }
  }, [players, toast, hasInitialized])

  // Handle score increment/decrement - allows negative scores
  const updateScore = (id: string, increment: number) => {
    setPlayers(players.map((player) => (player.id === id ? { ...player, score: player.score + increment } : player)))
  }

  // Handle player name edit
  const updatePlayerName = (id: string, newName: string) => {
    setPlayers(players.map((player) => (player.id === id ? { ...player, name: newName } : player)))
  }

  // Handle player removal
  const removePlayer = (id: string) => {
    if (players.length === 1) {
      toast({
        title: "Cannot remove player",
        description: "You must have at least one player in the game.",
        variant: "destructive",
      })
      return
    }

    setPlayers(players.filter((player) => player.id !== id))
  }

  // Add a new player
  const addPlayer = () => {
    // Get the next color index, cycling through the available colors
    const colorIndex = nextColorIndex.current % playerColors.length

    const newPlayer = {
      id: Date.now().toString(),
      name: `Player ${nextPlayerNumber.current}`,
      score: 0,
      colorIndex: colorIndex,
    }

    setPlayers([...players, newPlayer])
    nextPlayerNumber.current += 1
    nextColorIndex.current += 1
  }

  // Clear all scores
  const clearScores = () => {
    setPlayers(players.map((player) => ({ ...player, score: 0 })))
    toast({
      title: "Scores cleared",
      description: "All player scores have been reset to zero.",
    })
  }

  // Custom button style for score buttons
  const scoreButtonStyle = {
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl">Custom Game Scorekeeper</CardTitle>
            <CardDescription>Track scores for any game</CardDescription>
          </div>
          <Button variant="outline" onClick={clearScores} className="flex items-center gap-2">
            Clear Scores
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex flex-row items-center justify-between p-2 border rounded-lg ${
                  playerColors[player.colorIndex]
                }`}
              >
                {/* Minus button */}
                <Button
                  variant="outline"
                  onClick={() => updateScore(player.id, -1)}
                  style={scoreButtonStyle}
                  className="h-10 w-10 text-lg bg-background shrink-0"
                >
                  <Minus className="h-5 w-5" />
                </Button>

                {/* Player name and score */}
                <div className="flex flex-row items-center justify-between flex-1 px-2 gap-2">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="font-medium focus:outline-none focus:bg-background/80 px-2 py-1 rounded text-center min-w-[80px] max-w-[120px] text-base text-black truncate"
                    style={{ color: "black" }}
                    onBlur={(e) => updatePlayerName(player.id, e.currentTarget.textContent || player.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        e.currentTarget.blur()
                      }
                    }}
                  >
                    {player.name}
                  </div>
                  <div className="text-2xl font-bold tabular-nums text-black" style={{ color: "black" }}>
                    {player.score}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Plus button */}
                  <Button
                    variant="outline"
                    onClick={() => updateScore(player.id, 1)}
                    style={scoreButtonStyle}
                    className="h-10 w-10 text-lg bg-background"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(player.id)}
                    className="text-destructive hover:text-destructive h-10 w-10 bg-background/50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-4">
              <Button onClick={addPlayer} className="flex items-center gap-2 px-6 py-2">
                <Plus className="h-5 w-5" />
                <span>Add Player</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
