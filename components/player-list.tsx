"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, User, PlusCircle } from "lucide-react"
import type { Player } from "@/lib/types"
import PlayerForm from "@/components/player-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface PlayerListProps {
  players: Player[]
  onUpdatePlayer: (player: Player) => void
  onRemovePlayer: (playerId: string) => void
  onAddPlayer: () => void
  showRequiredFields?: boolean
  gameType: "8-Ball" | "9-Ball" | "Double-Jeopardy"
}

export default function PlayerList({
  players,
  onUpdatePlayer,
  onRemovePlayer,
  onAddPlayer,
  showRequiredFields = false,
  gameType,
}: PlayerListProps) {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null)

  const handleEditClick = (playerId: string) => {
    setEditingPlayerId(playerId)
  }

  const handleDeleteClick = (playerId: string) => {
    setPlayerToDelete(playerId)
  }

  const confirmDelete = () => {
    if (playerToDelete) {
      onRemovePlayer(playerToDelete)
      setPlayerToDelete(null)
    }
  }

  const handleSaveEdit = (updatedPlayer: Player) => {
    onUpdatePlayer(updatedPlayer)
    setEditingPlayerId(null)
  }

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Players</CardTitle>
            <CardDescription>No players added yet</CardDescription>
          </div>
          <Button variant="outline" onClick={onAddPlayer} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Player</span>
          </Button>
        </CardHeader>
        <CardContent className="text-center p-6">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Add players to your team using the "Add Player" button above
          </p>
        </CardContent>
      </Card>
    )
  }

  // Mobile-friendly player cards for small screens
  const renderMobilePlayerCards = () => {
    return (
      <div className="grid gap-4 md:hidden">
        {players.map((player) => (
          <div key={player.id} className="border rounded-lg p-4 bg-card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg line-clamp-2 break-words max-w-[70%]">{player.name}</h3>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => handleEditClick(player.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog
                  open={playerToDelete === player.id}
                  onOpenChange={(open) => !open && setPlayerToDelete(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(player.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>This will remove {player.name} from the team.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-2">
              {(gameType === "8-Ball" || gameType === "Double-Jeopardy") && (
                <div className="text-sm">
                  <span className="text-muted-foreground">8-Ball Skill:</span> {player.skillLevel8Ball || "-"}
                </div>
              )}
              {(gameType === "9-Ball" || gameType === "Double-Jeopardy") && (
                <div className="text-sm">
                  <span className="text-muted-foreground">9-Ball Skill:</span> {player.skillLevel9Ball || "-"}
                </div>
              )}
            </div>

            {showRequiredFields && (
              <div className="flex flex-wrap gap-1 mt-2">
                {player.absent && <Badge variant="destructive">Absent</Badge>}
                {gameType === "8-Ball" && player.required8Ball && <Badge variant="secondary">Required</Badge>}
                {gameType === "9-Ball" && player.required9Ball && <Badge variant="secondary">Required</Badge>}
                {gameType === "Double-Jeopardy" && (
                  <>
                    {player.required8Ball && <Badge variant="secondary">8-Ball Required</Badge>}
                    {player.required9Ball && <Badge variant="secondary">9-Ball Required</Badge>}
                  </>
                )}
                {!player.absent &&
                  !(
                    (gameType === "8-Ball" && player.required8Ball) ||
                    (gameType === "9-Ball" && player.required9Ball) ||
                    (gameType === "Double-Jeopardy" && (player.required8Ball || player.required9Ball))
                  ) && <Badge variant="outline">Available</Badge>}
              </div>
            )}

            {editingPlayerId === player.id && (
              <div className="mt-4 p-4 bg-muted/30 rounded-md">
                <h3 className="text-sm font-medium mb-2">Edit Player: {player.name}</h3>
                <PlayerForm
                  player={player}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingPlayerId(null)}
                  showRequiredFields={showRequiredFields}
                  gameType={gameType}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Desktop table view for larger screens
  const renderDesktopTable = () => {
    return (
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              {(gameType === "8-Ball" || gameType === "Double-Jeopardy") && <TableHead>8-Ball Skill</TableHead>}
              {(gameType === "9-Ball" || gameType === "Double-Jeopardy") && <TableHead>9-Ball Skill</TableHead>}
              {showRequiredFields && <TableHead>Status</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <>
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    <div className="truncate max-w-[200px] md:max-w-[250px] lg:max-w-[300px]" title={player.name}>
                      {player.name}
                    </div>
                  </TableCell>
                  {(gameType === "8-Ball" || gameType === "Double-Jeopardy") && (
                    <TableCell>{player.skillLevel8Ball || "-"}</TableCell>
                  )}
                  {(gameType === "9-Ball" || gameType === "Double-Jeopardy") && (
                    <TableCell>{player.skillLevel9Ball || "-"}</TableCell>
                  )}
                  {showRequiredFields && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {player.absent && <Badge variant="destructive">Absent</Badge>}
                        {gameType === "8-Ball" && player.required8Ball && <Badge variant="secondary">Required</Badge>}
                        {gameType === "9-Ball" && player.required9Ball && <Badge variant="secondary">Required</Badge>}
                        {gameType === "Double-Jeopardy" && (
                          <>
                            {player.required8Ball && <Badge variant="secondary">8-Ball Required</Badge>}
                            {player.required9Ball && <Badge variant="secondary">9-Ball Required</Badge>}
                          </>
                        )}
                        {!player.absent &&
                          !(
                            (gameType === "8-Ball" && player.required8Ball) ||
                            (gameType === "9-Ball" && player.required9Ball) ||
                            (gameType === "Double-Jeopardy" && (player.required8Ball || player.required9Ball))
                          ) && <Badge variant="outline">Available</Badge>}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(player.id)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>

                      <AlertDialog
                        open={playerToDelete === player.id}
                        onOpenChange={(open) => !open && setPlayerToDelete(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(player.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {player.name} from the team.
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
                  </TableCell>
                </TableRow>
                {editingPlayerId === player.id && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        gameType === "Double-Jeopardy" ? (showRequiredFields ? 5 : 4) : showRequiredFields ? 4 : 3
                      }
                      className="p-0"
                    >
                      <div className="p-4 bg-muted/30 rounded-md m-2">
                        <h3 className="text-sm font-medium mb-2">Edit Player: {player.name}</h3>
                        <PlayerForm
                          player={player}
                          onSave={handleSaveEdit}
                          onCancel={() => setEditingPlayerId(null)}
                          showRequiredFields={showRequiredFields}
                          gameType={gameType}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Players</CardTitle>
          <CardDescription>Manage your team players</CardDescription>
        </div>
        <Button variant="outline" onClick={onAddPlayer} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Add Player</span>
        </Button>
      </CardHeader>
      <CardContent>
        {renderMobilePlayerCards()}
        {renderDesktopTable()}

        {/* Bottom Add Player button */}
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={onAddPlayer} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Player</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
