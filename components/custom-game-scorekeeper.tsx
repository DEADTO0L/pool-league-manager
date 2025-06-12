"use client"

import { useState, useRef } from "react"
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

export default function CustomGameScorekeeper() {
  const [players, setPlayers] = useState<Player[]>([{ id: "1", name: "Player 1", score: 0, colorIndex: 0 }])
  const { toast } = useToast()
  const nextPlayerNumber = useRef(2)
  const nextColorIndex = useRef(1) // Start with the second color for the next player

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

  // Custom button style for large, clickable buttons
  const scoreButtonStyle = {
    width: "100px",
    height: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
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
          <div className="space-y-6">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg ${
                  playerColors[player.colorIndex]
                } gap-4`}
              >
                <div className="flex items-center justify-center">
                  {/* Large minus button */}
                  <Button
                    variant="outline"
                    onClick={() => updateScore(player.id, -1)}
                    style={scoreButtonStyle}
                    className="h-24 w-24 text-2xl bg-background"
                  >
                    <Minus className="h-12 w-12" />
                  </Button>
                </div>

                <div className="flex-1 mx-4 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="font-medium focus:outline-none focus:bg-background/80 px-3 py-2 rounded text-center w-full max-w-[250px] text-xl text-black"
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
                    <div className="text-4xl font-bold tabular-nums text-black" style={{ color: "black" }}>
                      {player.score}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Large plus button */}
                  <Button
                    variant="outline"
                    onClick={() => updateScore(player.id, 1)}
                    style={scoreButtonStyle}
                    className="h-24 w-24 text-2xl bg-background"
                  >
                    <Plus className="h-12 w-12" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(player.id)}
                    className="text-destructive hover:text-destructive h-12 w-12 ml-2 bg-background/50"
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-8">
              <Button onClick={addPlayer} className="flex items-center gap-2 px-8 py-3 text-xl">
                <Plus className="h-6 w-6" />
                <span>Add Player</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
