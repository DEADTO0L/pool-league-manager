"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Trash2, Users } from "lucide-react"
import type { Team } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import ShareTeamDialog from "./share-team-dialog"
import { cn } from "@/lib/utils"

interface TeamListProps {
  teams: Team[]
  onSelectTeam: (team: Team) => void
  onDeleteTeam: (teamId: string) => void
  currentTeamId?: string | null
}

export default function TeamList({ teams, onSelectTeam, onDeleteTeam, currentTeamId }: TeamListProps) {
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation() // Prevent card click from triggering
    setTeamToDelete(teamId)
  }

  const confirmDelete = () => {
    if (teamToDelete) {
      onDeleteTeam(teamToDelete)
      setTeamToDelete(null)
    }
  }

  if (teams.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No teams yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Create your first team to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => {
        const isSelected = team.id === currentTeamId

        return (
          <Card
            key={team.id}
            className={cn(
              "overflow-hidden transition-colors duration-200 cursor-pointer hover:bg-muted/50",
              isSelected ? "bg-purple-500/30 border-purple-500" : "",
            )}
            onClick={() => onSelectTeam(team)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-2 break-words" title={team.name}>
                {team.name}
                {isSelected && (
                  <span className="ml-2 text-sm font-normal text-purple-700 dark:text-purple-300">(Selected)</span>
                )}
              </CardTitle>
              <CardDescription>
                {team.players.length} player{team.players.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation() // Not strictly necessary since it does the same thing
                    onSelectTeam(team)
                  }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{isSelected ? "Selected" : "Select"}</span>
                </Button>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <ShareTeamDialog team={team} />

                  <AlertDialog open={teamToDelete === team.id} onOpenChange={(open) => !open && setTeamToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, team.id)}
                        className="flex items-center gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the team "{team.name}" and cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmDelete}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
