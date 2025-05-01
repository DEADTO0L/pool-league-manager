"use server"

import type { Team, User } from "./types"

// In a real app, this would be a database connection
// For this example, we'll use a simple in-memory store
const usersStore: Record<string, User> = {
  "1": {
    id: "1",
    username: "demo",
    password: "$2b$10$8r0S/CJ7U2JfhUhT1Sg9u.H.CkzQlR3iJL7tQrKGX2wSPBrOsUauK", // "password"
    email: "demo@example.com",
  },
}

const teamsStore: Record<string, Team[]> = {}
const sharedTeams: Record<string, string[]> = {} // userId -> teamIds

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const user = Object.values(usersStore).find((user) => user.username === username)
  return user || null
}

// Create a new user
export async function createUser(username: string, password: string, email: string): Promise<User | null> {
  // Check if username already exists
  const existingUser = await getUserByUsername(username)
  if (existingUser) {
    return null
  }

  const id = Date.now().toString()
  const newUser: User = {
    id,
    username,
    password, // In a real app, this would be hashed
    email,
  }

  usersStore[id] = newUser
  return newUser
}

// Get all teams for a user (including shared teams)
export async function getUserTeams(userId: string): Promise<Team[]> {
  // Get user's own teams
  const userTeams = teamsStore[userId] || []

  // Get teams shared with the user
  const sharedTeamIds = sharedTeams[userId] || []
  const allSharedTeams: Team[] = []

  // Find all shared teams across all users
  Object.entries(teamsStore).forEach(([ownerId, ownerTeams]) => {
    if (ownerId !== userId) {
      const shared = ownerTeams.filter((team) => sharedTeamIds.includes(team.id))
      allSharedTeams.push(
        ...shared.map((team) => ({
          ...team,
          isShared: true,
        })),
      )
    }
  })

  return [...userTeams, ...allSharedTeams]
}

// Save a team for a user
export async function saveTeam(userId: string, team: Team): Promise<Team> {
  if (!teamsStore[userId]) {
    teamsStore[userId] = []
  }

  const existingIndex = teamsStore[userId].findIndex((t) => t.id === team.id)

  if (existingIndex >= 0) {
    // Update existing team
    teamsStore[userId][existingIndex] = team
  } else {
    // Add new team
    teamsStore[userId].push(team)
  }

  return team
}

// Delete a team
export async function deleteTeam(userId: string, teamId: string): Promise<boolean> {
  if (!teamsStore[userId]) {
    return false
  }

  const initialLength = teamsStore[userId].length
  teamsStore[userId] = teamsStore[userId].filter((team) => team.id !== teamId)

  // Also remove any shares of this team
  Object.keys(sharedTeams).forEach((uid) => {
    sharedTeams[uid] = sharedTeams[uid].filter((id) => id !== teamId)
  })

  return teamsStore[userId].length < initialLength
}

// Share a team with another user
export async function shareTeam(teamId: string, targetUsername: string): Promise<boolean> {
  // Find the target user
  const targetUser = Object.values(usersStore).find((user) => user.username === targetUsername)

  if (!targetUser) {
    return false
  }

  // Add the team to the user's shared teams
  if (!sharedTeams[targetUser.id]) {
    sharedTeams[targetUser.id] = []
  }

  if (!sharedTeams[targetUser.id].includes(teamId)) {
    sharedTeams[targetUser.id].push(teamId)
  }

  return true
}

// Get users who have access to a team
export async function getTeamShares(teamId: string): Promise<string[]> {
  const sharedWith: string[] = []

  Object.entries(sharedTeams).forEach(([userId, teamIds]) => {
    if (teamIds.includes(teamId)) {
      const user = usersStore[userId]
      if (user) {
        sharedWith.push(user.username)
      }
    }
  })

  return sharedWith
}
