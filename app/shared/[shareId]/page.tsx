"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Download, User, RefreshCw } from "lucide-react"
import { getSharedTeam } from "@/lib/share-utils"
import type { Team, Player } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

export default function SharedTeamPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTeam = () => {
    if (!params.shareId) return

    setLoading(true)
    setError(null)

    const shareData = Array.isArray(params.shareId) ? params.shareId[0] : params.shareId

    try {
      const sharedTeam = getSharedTeam(shareData)
      if (sharedTeam) {
        // Ensure the team has a gameType
        setTeam({
          ...sharedTeam,
          gameType: sharedTeam.gameType || "8-Ball",
        })
      } else {
        setError("Team not found. The share link may be invalid or expired.")
      }
    } catch (err) {
      console.error("Error loading shared team:", err)
      setError("Failed to load the shared team. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeam()
  }, [params.shareId])

  const importTeam = () => {
    if (!team) return

    try {
      // Check if localStorage is available
      if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("localStorage is not available")
      }

      // Get existing teams from localStorage
      let teams = []
      try {
        const teamsJson = localStorage.getItem("poolLeagueTeams")
        if (teamsJson) {
          teams = JSON.parse(teamsJson)
          if (!Array.isArray(teams)) teams = []
        }
      } catch (parseError) {
        console.error("Error parsing teams:", parseError)
        teams = []
      }

      // Create a new copy of the team with a new ID
      const importedTeam: Team = {
        ...team,
        id: Date.now().toString(),
        name: `${team.name} (Imported)`,
      }

      // Add to teams and save
      teams.push(importedTeam)

      try {
        localStorage.setItem("poolLeagueTeams", JSON.stringify(teams))

        toast({
          title: "Team imported",
          description: "The team has been imported to your teams list",
        })

        // Navigate to home page
        router.push("/")
      } catch (saveError) {
        console.error("Error saving to localStorage:", saveError)
        throw new Error("Failed to save to localStorage")
      }
    } catch (err) {
      console.error("Import error:", err)
      toast({
        title: "Import failed",
        description: "Failed to import the team. Your browser may have limited storage.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div
            className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full mb-4"
            role="status"
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
          <p>Loading shared team...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={loadTeam}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Team Not Found</AlertTitle>
          <AlertDescription>The shared team could not be found. The link may be invalid or expired.</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  // Mobile-friendly view for the team details
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Button onClick={importTeam} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Import Team</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{team.name}</CardTitle>
          <CardDescription>Shared Team - Game Type: {team.gameType || "8-Ball"}</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium mb-4">Players</h3>

          {!team.players || team.players.length === 0 ? (
            <div className="text-center p-6 border rounded-lg bg-muted/50">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">This team has no players</p>
            </div>
          ) : (
            <>
              {/* Mobile view - cards */}
              <div className="md:hidden space-y-3">
                {team.players.map((player: Player, index) => (
                  <div key={player.id || index} className="border rounded-lg p-3 bg-card">
                    <div className="font-medium mb-1">{player.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>8-Ball: {player.skillLevel8Ball || "-"}</div>
                      <div>9-Ball: {player.skillLevel9Ball || "-"}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop view - table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>8-Ball Skill</TableHead>
                      <TableHead>9-Ball Skill</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.players.map((player: Player, index) => (
                      <TableRow key={player.id || index}>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>{player.skillLevel8Ball || "-"}</TableCell>
                        <TableCell>{player.skillLevel9Ball || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You can import this team to your teams list by clicking the Import button above.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
