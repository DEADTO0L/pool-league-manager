"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, ChevronDown, ChevronUp, Settings, Info, AlertCircle } from "lucide-react"
import type { Team, Player } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface TeamCombinationsProps {
  team: Team
  onUpdateTeam?: (team: Team) => void
}

export default function TeamCombinations({ team: initialTeam, onUpdateTeam }: TeamCombinationsProps) {
  const [team, setTeam] = useState<Team>(initialTeam)
  const [combinations8Ball, setCombinations8Ball] = useState<Player[][]>([])
  const [combinations9Ball, setCombinations9Ball] = useState<Player[][]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"8-Ball" | "9-Ball">("8-Ball")
  // Start with player selection collapsed by default
  const [isPlayerSelectionOpen, setIsPlayerSelectionOpen] = useState(false)

  // Track scroll positions and viewed status
  const [scrollPosition8Ball, setScrollPosition8Ball] = useState(0)
  const [scrollPosition9Ball, setScrollPosition9Ball] = useState(0)
  const [has8BallBeenViewed, setHas8BallBeenViewed] = useState(true) // Default tab is viewed
  const [has9BallBeenViewed, setHas9BallBeenViewed] = useState(false)

  // Refs for scroll containers
  const scrollRef8Ball = useRef<HTMLDivElement>(null)
  const scrollRef9Ball = useRef<HTMLDivElement>(null)
  const currentScrollRef = useRef<HTMLDivElement>(null)

  // Update local team state when the prop changes
  useEffect(() => {
    setTeam(initialTeam)
  }, [initialTeam])

  const updatePlayerStatus = (
    playerId: string,
    field: "required8Ball" | "required9Ball" | "absent",
    value: boolean,
  ) => {
    const updatedPlayers = team.players.map((player) => {
      if (player.id === playerId) {
        return { ...player, [field]: value }
      }
      return player
    })

    const updatedTeam = { ...team, players: updatedPlayers }
    setTeam(updatedTeam)

    // If onUpdateTeam is provided, call it to update the parent component
    if (onUpdateTeam) {
      onUpdateTeam(updatedTeam)
    }

    // Reset scroll positions when player status changes
    resetScrollPositions()
  }

  // Handle game type change
  const handleGameTypeChange = (value: "8-Ball" | "9-Ball" | "Double-Jeopardy") => {
    const updatedTeam = { ...team, gameType: value }
    setTeam(updatedTeam)

    // If onUpdateTeam is provided, call it to update the parent component
    if (onUpdateTeam) {
      onUpdateTeam(updatedTeam)
    }

    // Reset active tab to 8-Ball when changing game type
    setActiveTab("8-Ball")

    // Reset scroll positions and viewed status when game type changes
    resetScrollPositions()
    setHas8BallBeenViewed(true)
    setHas9BallBeenViewed(false)
  }

  // Reset scroll positions
  const resetScrollPositions = () => {
    setScrollPosition8Ball(0)
    setScrollPosition9Ball(0)

    // Reset scroll containers if they exist
    if (scrollRef8Ball.current) {
      scrollRef8Ball.current.scrollTop = 0
    }
    if (scrollRef9Ball.current) {
      scrollRef9Ball.current.scrollTop = 0
    }
  }

  const generateCombinations = () => {
    setIsGenerating(true)
    setError(null)

    // Generate 8-Ball combinations
    if (team.gameType === "8-Ball" || team.gameType === "Double-Jeopardy") {
      generateGameTypeCombinations("8-Ball")
    }

    // Generate 9-Ball combinations if needed
    if (team.gameType === "9-Ball" || team.gameType === "Double-Jeopardy") {
      generateGameTypeCombinations("9-Ball")
    }

    setIsGenerating(false)

    // Reset scroll positions when combinations are regenerated
    resetScrollPositions()

    // Reset viewed status for 9-Ball if we're in Double Jeopardy mode
    if (team.gameType === "Double-Jeopardy") {
      setHas9BallBeenViewed(false)
    }
  }

  const generateGameTypeCombinations = (gameType: "8-Ball" | "9-Ball") => {
    // Filter out absent players
    const availablePlayers = team.players.filter((player) => !player.absent)

    // Check if we have required players for the game type
    const requiredPlayers = availablePlayers.filter((player) =>
      gameType === "8-Ball" ? player.required8Ball : player.required9Ball,
    )

    // Check if we have enough players
    const playersNeeded = 5
    const ghostPlayersNeeded = Math.max(0, playersNeeded - availablePlayers.length)

    // Create ghost players if needed
    const ghostPlayers: Player[] = []
    if (ghostPlayersNeeded > 0) {
      for (let i = 0; i < ghostPlayersNeeded; i++) {
        ghostPlayers.push({
          id: `ghost-${gameType}-${i}`,
          name: `Ghost/Makeup Player ${i + 1}`,
          skillLevel8Ball: 0,
          skillLevel9Ball: 0,
          required8Ball: false,
          required9Ball: false,
          absent: false,
        })
      }

      // Add warning message if any ghost players are needed
      setError((prev) => {
        const warningMsg = `Only ${availablePlayers.length} players available for ${gameType}. Ghost/Makeup players will be added.`
        return prev ? `${prev}\n${warningMsg}` : warningMsg
      })

      // Add stronger warning if 2 or more ghost players are needed
      if (ghostPlayersNeeded >= 2) {
        setError((prev) => {
          const warningMsg = `Your team is short ${ghostPlayersNeeded} players. Consider rescheduling this week's match and contacting the other team's captain.`
          return prev ? `${prev}\n${warningMsg}` : warningMsg
        })
      }
    }

    // Add ghost players to available players
    const allAvailablePlayers = [...availablePlayers, ...ghostPlayers]

    // Check if required players exceed 5
    if (requiredPlayers.length > 5) {
      setError(`Too many required players. You have more than 5 required players for ${gameType}.`)
      return
    }

    // Get optional players (not required and not ghost)
    const optionalPlayers = allAvailablePlayers.filter((player) =>
      gameType === "8-Ball" ? !player.required8Ball : !player.required9Ball,
    )

    // Generate all possible combinations of optional players
    const validCombinations: Player[][] = []

    // Function to generate combinations
    const generateValidCombinations = (
      optionalPlayers: Player[],
      requiredPlayers: Player[],
      currentCombination: Player[] = [],
      startIndex = 0,
    ) => {
      // If we have enough players (5 total including required)
      if (currentCombination.length + requiredPlayers.length === 5) {
        // Create a full combination with required players
        const fullCombination = [...currentCombination, ...requiredPlayers]

        // Calculate total skill level based on game type
        const totalSkill = fullCombination.reduce((sum, player) => {
          const skillLevel = gameType === "8-Ball" ? player.skillLevel8Ball || 0 : player.skillLevel9Ball || 0
          return sum + skillLevel
        }, 0)

        // Count players with skill level 6 or higher
        const highSkillCount = fullCombination.filter((player) => {
          const skillLevel = gameType === "8-Ball" ? player.skillLevel8Ball || 0 : player.skillLevel9Ball || 0
          return skillLevel >= 6
        }).length

        // Check if skill level is valid (≤ 23) and max two players with skill level 6 or higher
        if (totalSkill <= 23 && highSkillCount <= 2) {
          // Sort players by skill level in descending order
          const sortedCombination = [...fullCombination].sort((a, b) => {
            const skillA = gameType === "8-Ball" ? a.skillLevel8Ball || 0 : a.skillLevel9Ball || 0
            const skillB = gameType === "8-Ball" ? b.skillLevel8Ball || 0 : b.skillLevel9Ball || 0
            return skillB - skillA
          })

          validCombinations.push(sortedCombination)
        }
        return
      }

      // If we've used too many optional players, return
      if (currentCombination.length > 5 - requiredPlayers.length) {
        return
      }

      // Try adding each remaining optional player
      for (let i = startIndex; i < optionalPlayers.length; i++) {
        generateValidCombinations(optionalPlayers, requiredPlayers, [...currentCombination, optionalPlayers[i]], i + 1)
      }
    }

    // Start the generation process
    generateValidCombinations(optionalPlayers, requiredPlayers)

    // If we have no valid combinations but have ghost players, create a default combination
    if (validCombinations.length === 0 && ghostPlayersNeeded > 0) {
      // Create a default combination with all available players and necessary ghost players
      const defaultCombination = [...availablePlayers]

      // Add ghost players to reach 5 total players
      for (let i = 0; i < Math.min(ghostPlayersNeeded, 5 - availablePlayers.length); i++) {
        defaultCombination.push(ghostPlayers[i])
      }

      // Sort by skill level
      defaultCombination.sort((a, b) => {
        const skillA = gameType === "8-Ball" ? a.skillLevel8Ball || 0 : a.skillLevel9Ball || 0
        const skillB = gameType === "8-Ball" ? b.skillLevel8Ball || 0 : b.skillLevel9Ball || 0
        return skillB - skillA
      })

      validCombinations.push(defaultCombination)
    }

    // Sort combinations by total skill level (descending)
    validCombinations.sort((a, b) => {
      const skillA = a.reduce((sum, player) => {
        const skillLevel = gameType === "8-Ball" ? player.skillLevel8Ball || 0 : player.skillLevel9Ball || 0
        return sum + skillLevel
      }, 0)

      const skillB = b.reduce((sum, player) => {
        const skillLevel = gameType === "8-Ball" ? player.skillLevel8Ball || 0 : player.skillLevel9Ball || 0
        return sum + skillLevel
      }, 0)

      return skillB - skillA
    })

    // Set the appropriate combinations state
    if (gameType === "8-Ball") {
      setCombinations8Ball(validCombinations)
      if (validCombinations.length === 0) {
        setError((prev) =>
          prev ? `${prev}\nNo valid 8-Ball combinations found.` : "No valid 8-Ball combinations found.",
        )
      }
    } else {
      setCombinations9Ball(validCombinations)
      if (validCombinations.length === 0) {
        setError((prev) =>
          prev ? `${prev}\nNo valid 9-Ball combinations found.` : "No valid 9-Ball combinations found.",
        )
      }
    }
  }

  // Generate combinations when team changes
  useEffect(() => {
    generateCombinations()
  }, [team])

  // Handle result tab change in combinations tab
  const handleResultTabChange = (value: "8-Ball" | "9-Ball") => {
    // Save current scroll position before changing tabs
    if (activeTab === "8-Ball" && currentScrollRef.current) {
      setScrollPosition8Ball(currentScrollRef.current.scrollTop)
    } else if (activeTab === "9-Ball" && currentScrollRef.current) {
      setScrollPosition9Ball(currentScrollRef.current.scrollTop)
    }

    // Update active tab
    setActiveTab(value as "8-Ball" | "9-Ball")

    // Mark the tab as viewed
    if (value === "9-Ball") {
      setHas9BallBeenViewed(true)
    } else {
      setHas8BallBeenViewed(true)
    }
  }

  // Effect to restore scroll position when tab changes
  useEffect(() => {
    // Set the current scroll ref based on active tab
    if (activeTab === "8-Ball") {
      currentScrollRef.current = scrollRef8Ball.current

      // Restore scroll position for 8-Ball if it has been viewed before
      if (has8BallBeenViewed && scrollRef8Ball.current) {
        scrollRef8Ball.current.scrollTop = scrollPosition8Ball
      }
    } else {
      currentScrollRef.current = scrollRef9Ball.current

      // Restore scroll position for 9-Ball only if it has been viewed before
      if (has9BallBeenViewed && scrollRef9Ball.current) {
        scrollRef9Ball.current.scrollTop = scrollPosition9Ball
      }
    }
  }, [activeTab, has8BallBeenViewed, has9BallBeenViewed, scrollPosition8Ball, scrollPosition9Ball])

  // Get the current combinations based on active tab and game type
  const getCurrentCombinations = () => {
    if (team.gameType === "Double-Jeopardy") {
      return activeTab === "8-Ball" ? combinations8Ball : combinations9Ball
    } else if (team.gameType === "8-Ball") {
      return combinations8Ball
    } else {
      return combinations9Ball
    }
  }

  const combinations = getCurrentCombinations()

  // Toggle player selection panel
  const togglePlayerSelection = () => {
    setIsPlayerSelectionOpen(!isPlayerSelectionOpen)
  }

  // Handle scroll events to save positions
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop
    if (activeTab === "8-Ball") {
      setScrollPosition8Ball(scrollTop)
    } else {
      setScrollPosition9Ball(scrollTop)
    }
  }

  // Mobile-friendly player selection cards
  const renderMobilePlayerSelection = () => {
    return (
      <div className="md:hidden">
        {team.players.map((player) => (
          <div key={player.id} className="border rounded-lg p-4 mb-3 bg-card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium line-clamp-2 break-words max-w-[70%]">{player.name}</h3>
              <div className="flex items-center gap-2 shrink-0">
                {(team.gameType === "8-Ball" || team.gameType === "Double-Jeopardy") && (
                  <span className="text-xs text-muted-foreground">8-Ball: {player.skillLevel8Ball || "-"}</span>
                )}
                {(team.gameType === "9-Ball" || team.gameType === "Double-Jeopardy") && (
                  <span className="text-xs text-muted-foreground">9-Ball: {player.skillLevel9Ball || "-"}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(team.gameType === "8-Ball" || team.gameType === "Double-Jeopardy") && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-${player.id}-8ball`}
                    checked={player.required8Ball}
                    onCheckedChange={(checked) => updatePlayerStatus(player.id, "required8Ball", checked === true)}
                  />
                  <Label htmlFor={`mobile-${player.id}-8ball`} className="text-xs">
                    {team.gameType === "8-Ball" ? "Required Player" : "Required for 8-Ball"}
                  </Label>
                </div>
              )}

              {(team.gameType === "9-Ball" || team.gameType === "Double-Jeopardy") && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-${player.id}-9ball`}
                    checked={player.required9Ball}
                    onCheckedChange={(checked) => updatePlayerStatus(player.id, "required9Ball", checked === true)}
                  />
                  <Label htmlFor={`mobile-${player.id}-9ball`} className="text-xs">
                    {team.gameType === "9-Ball" ? "Required Player" : "Required for 9-Ball"}
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`mobile-${player.id}-absent`}
                  checked={player.absent}
                  onCheckedChange={(checked) => updatePlayerStatus(player.id, "absent", checked === true)}
                />
                <Label htmlFor={`mobile-${player.id}-absent`} className="text-xs">
                  Absent
                </Label>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Desktop table view for player selection
  const renderDesktopPlayerSelection = () => {
    return (
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Player</TableHead>
              {(team.gameType === "8-Ball" || team.gameType === "Double-Jeopardy") && (
                <TableHead>8-Ball Skill</TableHead>
              )}
              {(team.gameType === "9-Ball" || team.gameType === "Double-Jeopardy") && (
                <TableHead>9-Ball Skill</TableHead>
              )}
              {(team.gameType === "8-Ball" || team.gameType === "Double-Jeopardy") && (
                <TableHead className="text-center">
                  {team.gameType === "8-Ball" ? "Required Player" : "Required for 8-Ball"}
                </TableHead>
              )}
              {(team.gameType === "9-Ball" || team.gameType === "Double-Jeopardy") && (
                <TableHead className="text-center">
                  {team.gameType === "9-Ball" ? "Required Player" : "Required for 9-Ball"}
                </TableHead>
              )}
              <TableHead className="text-center">Absent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.players.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">
                  <div className="truncate max-w-[150px] md:max-w-[200px] lg:max-w-[250px]" title={player.name}>
                    {player.name}
                  </div>
                </TableCell>
                {(team.gameType === "8-Ball" || team.gameType === "Double-Jeopardy") && (
                  <TableCell>{player.skillLevel8Ball || "-"}</TableCell>
                )}
                {(team.gameType === "9-Ball" || team.gameType === "Double-Jeopardy") && (
                  <TableCell>{player.skillLevel9Ball || "-"}</TableCell>
                )}
                {(team.gameType === "8-Ball" || team.gameType === "Double-Jeopardy") && (
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        id={`${player.id}-8ball`}
                        checked={player.required8Ball}
                        onCheckedChange={(checked) => updatePlayerStatus(player.id, "required8Ball", checked === true)}
                      />
                    </div>
                  </TableCell>
                )}
                {(team.gameType === "9-Ball" || team.gameType === "Double-Jeopardy") && (
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        id={`${player.id}-9ball`}
                        checked={player.required9Ball}
                        onCheckedChange={(checked) => updatePlayerStatus(player.id, "required9Ball", checked === true)}
                      />
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      id={`${player.id}-absent`}
                      checked={player.absent}
                      onCheckedChange={(checked) => updatePlayerStatus(player.id, "absent", checked === true)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Render the combinations list with appropriate scroll handling
  const renderCombinationsList = () => {
    if (combinations.length > 0) {
      return (
        <ScrollArea
          className="h-[400px] rounded-md border"
          onScroll={handleScroll}
          ref={activeTab === "8-Ball" ? scrollRef8Ball : scrollRef9Ball}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
            {combinations.map((combo, index) => {
              const currentGameType =
                team.gameType === "8-Ball" || (team.gameType === "Double-Jeopardy" && activeTab === "8-Ball")
                  ? "8-Ball"
                  : "9-Ball"

              const totalSkill = combo.reduce((sum, player) => {
                const skillLevel =
                  currentGameType === "8-Ball" ? player.skillLevel8Ball || 0 : player.skillLevel9Ball || 0
                return sum + skillLevel
              }, 0)

              return (
                <div key={index} className="p-2 border rounded-lg text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-xs">Combo #{index + 1}</span>
                    <Badge variant="secondary" className="text-xs">
                      Skill: {totalSkill}/23
                    </Badge>
                  </div>
                  <div className="grid gap-1">
                    {combo.map((player) => {
                      const skillLevel =
                        currentGameType === "8-Ball" ? player.skillLevel8Ball || 0 : player.skillLevel9Ball || 0

                      // Highlight players with skill level 6 or higher
                      const isHighSkill = skillLevel >= 6

                      // Check if this is a ghost player
                      const isGhostPlayer = player.id.startsWith("ghost-")

                      return (
                        <div
                          key={player.id}
                          className={`flex justify-between items-center py-1 px-2 rounded text-xs ${
                            isGhostPlayer ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className={`truncate max-w-[120px] sm:max-w-[150px] md:max-w-[100px] lg:max-w-[150px] ${
                                isGhostPlayer ? "italic text-yellow-800 dark:text-yellow-300" : ""
                              }`}
                              title={player.name}
                            >
                              {player.name}
                            </span>
                            {currentGameType === "8-Ball" && player.required8Ball && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {team.gameType === "8-Ball" ? "Required" : "Required for 8-Ball"}
                              </Badge>
                            )}
                            {currentGameType === "9-Ball" && player.required9Ball && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {team.gameType === "9-Ball" ? "Required" : "Required for 9-Ball"}
                              </Badge>
                            )}
                            {isGhostPlayer && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 px-1 bg-yellow-100 text-yellow-800 border-yellow-300"
                              >
                                Ghost
                              </Badge>
                            )}
                          </div>
                          <Badge variant={isHighSkill ? "secondary" : "outline"} className="text-[10px] h-4 px-1">
                            SL: {skillLevel}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )
    } else if (!error) {
      return (
        <div className="text-center p-8 border rounded-lg bg-muted/50">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Generating combinations...</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we calculate all valid team combinations
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold truncate max-w-[80%]" title={team.name}>
          {team.name}
        </h2>
      </div>

      {/* Player Selection Section - Collapsed by default */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Player Selection
              </CardTitle>
              <CardDescription>
                {isPlayerSelectionOpen
                  ? "Set player requirements and availability"
                  : "Expand to customize player roster, mark required players, or set absences"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={togglePlayerSelection}>
              {isPlayerSelectionOpen ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Expand to Customize</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {/* Manually controlled content visibility */}
        {isPlayerSelectionOpen && (
          <CardContent>
            {renderMobilePlayerSelection()}
            {renderDesktopPlayerSelection()}
          </CardContent>
        )}
      </Card>

      {/* Game Type Selection */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Type</CardTitle>
            <CardDescription>Select the game type for team combinations</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={team.gameType}
              onValueChange={(value) => handleGameTypeChange(value as "8-Ball" | "9-Ball" | "Double-Jeopardy")}
              className="flex flex-col space-y-1 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="8-Ball" id="combo-8-ball" />
                <Label htmlFor="combo-8-ball">8-Ball</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9-Ball" id="combo-9-ball" />
                <Label htmlFor="combo-9-ball">9-Ball</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Double-Jeopardy" id="combo-double-jeopardy" />
                <Label htmlFor="combo-double-jeopardy">Double Jeopardy (8-Ball & 9-Ball)</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Team Combinations Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Team Combinations</CardTitle>
            <CardDescription>Valid 5-player combinations with skill level sum ≤ 23</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && error.includes("Consider rescheduling") && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {error && !error.includes("Consider rescheduling") && error.includes("Ghost/Makeup") && (
            <Alert variant="warning" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Notice</AlertTitle>
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {error && !error.includes("Consider rescheduling") && !error.includes("Ghost/Makeup") && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {team.gameType === "Double-Jeopardy" && (
            <div className="mb-4">
              <Tabs value={activeTab} onValueChange={(value) => handleResultTabChange(value as "8-Ball" | "9-Ball")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="8-Ball" className="px-1 sm:px-3 h-auto py-2 whitespace-normal text-xs sm:text-sm">
                    <span className="text-center">
                      8-Ball
                      <br className="sm:hidden" /> Combinations
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="9-Ball" className="px-1 sm:px-3 h-auto py-2 whitespace-normal text-xs sm:text-sm">
                    <span className="text-center">
                      9-Ball
                      <br className="sm:hidden" /> Combinations
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>
              Found {combinations.length} valid combinations for{" "}
              {team.gameType === "Double-Jeopardy" ? activeTab : team.gameType}
            </AlertTitle>
            <AlertDescription className="text-xs">
              Players not marked as absent, skill sum ≤ 23, max two players with skill level 6 or higher
            </AlertDescription>
          </Alert>

          {renderCombinationsList()}
        </CardContent>
      </Card>
    </div>
  )
}
