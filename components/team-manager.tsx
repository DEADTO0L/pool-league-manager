"use client"

import { useState, useEffect } from "react"
import TeamEditor from "@/components/team-editor"
import TeamCombinations from "@/components/team-combinations"
import TeamList from "@/components/team-list"
import type { Team } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ReportErrorButton } from "@/components/report-error-button"

// Example team data
const exampleTeamData: Team = {
  id: "example-team-1",
  name: "Ex Team: Phở Cue",
  gameType: "Double-Jeopardy",
  players: [
    {
      id: "player-1",
      name: "John Doe",
      skillLevel8Ball: 6,
      skillLevel9Ball: 5,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
    {
      id: "player-2",
      name: "Suzie Homemaker",
      skillLevel8Ball: 4,
      skillLevel9Ball: 3,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
    {
      id: "player-3",
      name: 'Rick "Cue-Tip" Thunderpants',
      skillLevel8Ball: 3,
      skillLevel9Ball: 5,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
    {
      id: "player-4",
      name: "Barbara Pocketqueen",
      skillLevel8Ball: 5,
      skillLevel9Ball: 4,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
    {
      id: "player-5",
      name: 'Larry "Scratch Master" McGee',
      skillLevel8Ball: 2,
      skillLevel9Ball: 2,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
    {
      id: "player-6",
      name: "Mildred the Menace",
      skillLevel8Ball: 6,
      skillLevel9Ball: 6,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
    {
      id: "player-7",
      name: "Chaz Cueballington III",
      skillLevel8Ball: 2,
      skillLevel9Ball: 2,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
    {
      id: "player-8",
      name: 'Tammy "Bank Shot" Turnipseed',
      skillLevel8Ball: 3,
      skillLevel9Ball: 4,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
    {
      id: "player-9",
      name: 'Gregory "Whiff" McSnooker',
      skillLevel8Ball: 4,
      skillLevel9Ball: 2,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
    {
      id: "player-10",
      name: "Nancy No-Chalk Nelson",
      skillLevel8Ball: 2,
      skillLevel9Ball: 1,
      required8Ball: false,
      required9Ball: false,
      absent: false,
    },
  ],
}

export default function TeamManager() {
  const [teams, setTeams] = useState<Team[]>([exampleTeamData]) // Initialize with example team by default
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [activeTab, setActiveTab] = useState("teams")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [hasInitialized, setHasInitialized] = useState(false)

  // Load teams from localStorage on component mount with error handling
  useEffect(() => {
    if (hasInitialized) return // Prevent multiple initializations

    try {
      const savedTeams = localStorage.getItem("poolLeagueTeams")
      let loadedTeams: Team[] = []

      if (savedTeams) {
        try {
          const parsedTeams = JSON.parse(savedTeams)
          if (Array.isArray(parsedTeams) && parsedTeams.length > 0) {
            // Ensure all teams have a gameType property
            loadedTeams = parsedTeams.map((team: Team) => ({
              ...team,
              gameType: team.gameType || "8-Ball",
            }))
          } else {
            // If parsed teams is empty or not an array, use example team
            loadedTeams = [exampleTeamData]
            localStorage.setItem("poolLeagueTeams", JSON.stringify([exampleTeamData]))
          }
        } catch (parseError) {
          console.error("Failed to parse saved teams:", parseError)
          loadedTeams = [exampleTeamData]
          localStorage.setItem("poolLeagueTeams", JSON.stringify([exampleTeamData]))
        }
      } else {
        // If no teams exist, create the example team
        loadedTeams = [exampleTeamData]
        try {
          localStorage.setItem("poolLeagueTeams", JSON.stringify([exampleTeamData]))
        } catch (e) {
          console.error("Failed to save example team to localStorage:", e)
        }
      }

      setTeams(loadedTeams)
      setHasInitialized(true)
    } catch (e) {
      console.error("Error accessing localStorage:", e)
      // Fallback to example team if localStorage is not available
      setTeams([exampleTeamData])
    } finally {
      setIsLoading(false)
    }
  }, [hasInitialized])

  // Save teams to localStorage whenever they change with error handling
  useEffect(() => {
    if (!hasInitialized) return // Don't save until initial load is complete

    if (teams.length > 0) {
      try {
        // Create a clean copy to avoid circular references
        const cleanTeams = JSON.parse(JSON.stringify(teams))
        localStorage.setItem("poolLeagueTeams", JSON.stringify(cleanTeams))
      } catch (e) {
        console.error("Failed to save teams to localStorage:", e)

        // Show a toast notification if saving fails
        toast({
          title: "Storage Error",
          description: "Failed to save teams. Your browser may have limited storage.",
          variant: "destructive",
        })
      }
    }
  }, [teams, toast, hasInitialized])

  const createNewTeam = () => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name: "New Team",
      players: [],
      gameType: "8-Ball",
    }
    setTeams([...teams, newTeam])
    setCurrentTeam(newTeam)
    setActiveTab("editor")
    toast({
      title: "Team created",
      description: "New team has been created. Add players to get started.",
    })
  }

  const updateTeam = (updatedTeam: Team) => {
    setTeams(teams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)))
    setCurrentTeam(updatedTeam)
  }

  const deleteTeam = (teamId: string) => {
    const teamToDelete = teams.find((team) => team.id === teamId)
    setTeams(teams.filter((team) => team.id !== teamId))
    if (currentTeam?.id === teamId) {
      setCurrentTeam(null)
    }

    if (teamToDelete) {
      toast({
        title: "Team deleted",
        description: `"${teamToDelete.name}" has been deleted.`,
      })
    }
  }

  const selectTeam = (team: Team) => {
    setCurrentTeam(team)
    setActiveTab("combinations")
  }

  // Check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      const testKey = "__test__"
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }

  // Get background image based on game type
  const getBackgroundImage = () => {
    if (!currentTeam)
      return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Double%20Jeopardy-iCiciTWTgAzGKBDCyFXCDUJFcVBQdv.png"

    switch (currentTeam.gameType) {
      case "8-Ball":
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8%20Ball-jOKTRB1IZ8ErLBHPhRqJnQmOvqF45m.png"
      case "9-Ball":
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9%20Ball-SR0subaeziyPEJhd6iXy69aLJnvAYY.png"
      case "Double-Jeopardy":
      default:
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Double%20Jeopardy-iCiciTWTgAzGKBDCyFXCDUJFcVBQdv.png"
    }
  }

  // Common tab button style to ensure consistency across devices
  const getTabButtonStyle = (tabName: string) => {
    let backgroundColor

    if (tabName === "teams") {
      backgroundColor = "green"
    } else if (tabName === "editor") {
      backgroundColor = "blue"
    } else {
      backgroundColor = "red"
    }

    return {
      backgroundColor: backgroundColor,
      color: "black", // Always black text for better readability
      fontWeight: "bold",
      padding: "10px",
      borderRadius: "4px",
      border: activeTab === tabName ? "2px solid black" : "none",
      cursor:
        tabName === "teams" || (currentTeam && (tabName === "editor" || tabName === "combinations"))
          ? "pointer"
          : "not-allowed",
      opacity: tabName === "teams" || (currentTeam && (tabName === "editor" || tabName === "combinations")) ? 1 : 0.5,
      zIndex: 10, // Ensure buttons are above background
      textShadow: "0px 0px 2px rgba(255, 255, 255, 0.8)", // Add text shadow for better contrast
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%",
      minHeight: "44px", // Ensure good tap target size on mobile
    }
  }

  return (
    <div className="space-y-6">
      {!isLocalStorageAvailable() && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Warning</p>
          <p>Your browser doesn't support or has disabled local storage. Your teams won't be saved between sessions.</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="w-full">
          <div className="grid grid-cols-3 gap-1 mb-4">
            <button onClick={() => setActiveTab("teams")} style={getTabButtonStyle("teams")}>
              <span style={{ color: "black" }}>Teams</span>
            </button>
            <button
              onClick={() => currentTeam && setActiveTab("editor")}
              disabled={!currentTeam}
              style={getTabButtonStyle("editor")}
            >
              <span style={{ color: "black" }}>Team Editor</span>
            </button>
            <button
              onClick={() => currentTeam && setActiveTab("combinations")}
              disabled={!currentTeam}
              style={getTabButtonStyle("combinations")}
            >
              <span style={{ color: "black" }}>Combinations</span>
            </button>
          </div>

          {activeTab === "teams" && (
            <div className="space-y-4 relative min-h-[800px]">
              {/* Background image for Teams tab */}
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage:
                    "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Double%20Jeopardy-iCiciTWTgAzGKBDCyFXCDUJFcVBQdv.png)",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  opacity: 0.7,
                  zIndex: -1,
                  pointerEvents: "none",
                }}
              ></div>

              <div className="relative" style={{ zIndex: 1 }}>
                <div className="flex justify-end">
                  <Button onClick={createNewTeam} className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create New Team</span>
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center p-8">
                    <p>Loading your teams...</p>
                  </div>
                ) : (
                  <TeamList
                    teams={teams}
                    onSelectTeam={selectTeam}
                    onDeleteTeam={deleteTeam}
                    currentTeamId={currentTeam?.id}
                  />
                )}

                {/* Report Error Button */}
                <ReportErrorButton />
              </div>
            </div>
          )}

          {activeTab === "editor" && currentTeam && (
            <div className="relative min-h-[800px]">
              {/* Background image for Editor tab */}
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${getBackgroundImage()})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  opacity: 0.7,
                  zIndex: -1,
                  pointerEvents: "none",
                }}
              ></div>

              <div className="relative" style={{ zIndex: 1 }}>
                <TeamEditor team={currentTeam} onUpdateTeam={updateTeam} />

                {/* Report Error Button */}
                <ReportErrorButton />
              </div>
            </div>
          )}

          {activeTab === "combinations" && currentTeam && (
            <div className="relative min-h-[800px]">
              {/* Background image for Combinations tab */}
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${getBackgroundImage()})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  opacity: 0.7,
                  zIndex: -1,
                  pointerEvents: "none",
                }}
              ></div>

              <div className="relative" style={{ zIndex: 1 }}>
                <TeamCombinations team={currentTeam} onUpdateTeam={updateTeam} />

                {/* Report Error Button */}
                <ReportErrorButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
