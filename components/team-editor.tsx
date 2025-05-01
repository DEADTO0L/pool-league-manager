"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Team, Player } from "@/lib/types"
import PlayerForm from "@/components/player-form"
import PlayerList from "@/components/player-list"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface TeamEditorProps {
  team: Team
  onUpdateTeam: (team: Team) => void
}

export default function TeamEditor({ team, onUpdateTeam }: TeamEditorProps) {
  const [editedTeam, setEditedTeam] = useState<Team>({
    ...team,
    gameType: team.gameType || "8-Ball",
  })
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const { toast } = useToast()

  // Update local state when team prop changes
  useEffect(() => {
    setEditedTeam({
      ...team,
      gameType: team.gameType || "8-Ball",
    })
  }, [team])

  // Auto-save when team name changes
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedTeam = { ...editedTeam, name: e.target.value }
    setEditedTeam(updatedTeam)
    onUpdateTeam(updatedTeam)
  }

  // Auto-save when game type changes
  const handleGameTypeChange = (value: "8-Ball" | "9-Ball" | "Double-Jeopardy") => {
    const updatedTeam = { ...editedTeam, gameType: value }
    setEditedTeam(updatedTeam)
    onUpdateTeam(updatedTeam)

    toast({
      title: "Game type updated",
      description: `Team game type set to ${value}.`,
    })
  }

  // Handle adding a player button click
  const handleAddPlayerClick = () => {
    setIsAddingPlayer(true)
  }

  // Auto-save when adding a player
  const addPlayer = (player: Player) => {
    const updatedTeam = {
      ...editedTeam,
      players: [...editedTeam.players, player],
    }
    setEditedTeam(updatedTeam)
    onUpdateTeam(updatedTeam)
    setIsAddingPlayer(false)

    toast({
      title: "Player added",
      description: `${player.name} has been added to the team.`,
    })
  }

  // Auto-save when updating a player
  const updatePlayer = (updatedPlayer: Player) => {
    const updatedTeam = {
      ...editedTeam,
      players: editedTeam.players.map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player)),
    }
    setEditedTeam(updatedTeam)
    onUpdateTeam(updatedTeam)

    toast({
      title: "Player updated",
      description: `${updatedPlayer.name} has been updated.`,
    })
  }

  // Auto-save when removing a player
  const removePlayer = (playerId: string) => {
    const playerToRemove = editedTeam.players.find((p) => p.id === playerId)
    const updatedTeam = {
      ...editedTeam,
      players: editedTeam.players.filter((player) => player.id !== playerId),
    }
    setEditedTeam(updatedTeam)
    onUpdateTeam(updatedTeam)

    if (playerToRemove) {
      toast({
        title: "Player removed",
        description: `${playerToRemove.name} has been removed from the team.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
          <CardDescription>Edit your team information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              value={editedTeam.name}
              onChange={handleTeamNameChange}
              placeholder="Enter team name"
            />
          </div>

          <div className="space-y-2">
            <Label>Game Type</Label>
            <RadioGroup
              value={editedTeam.gameType}
              onValueChange={(value) => handleGameTypeChange(value as "8-Ball" | "9-Ball" | "Double-Jeopardy")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="8-Ball" id="8-ball" />
                <Label htmlFor="8-ball">8-Ball</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9-Ball" id="9-ball" />
                <Label htmlFor="9-ball">9-Ball</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Double-Jeopardy" id="double-jeopardy" />
                <Label htmlFor="double-jeopardy">Double Jeopardy (8-Ball & 9-Ball)</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {isAddingPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Player</CardTitle>
            <CardDescription>Enter player details</CardDescription>
          </CardHeader>
          <CardContent>
            <PlayerForm
              onSave={addPlayer}
              onCancel={() => setIsAddingPlayer(false)}
              showRequiredFields={false}
              gameType={editedTeam.gameType}
            />
          </CardContent>
        </Card>
      )}

      <PlayerList
        players={editedTeam.players}
        onUpdatePlayer={updatePlayer}
        onRemovePlayer={removePlayer}
        onAddPlayer={handleAddPlayerClick}
        showRequiredFields={false}
        gameType={editedTeam.gameType}
      />
    </div>
  )
}
