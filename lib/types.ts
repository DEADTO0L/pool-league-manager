export interface Player {
  id: string
  name: string
  skillLevel8Ball?: number
  skillLevel9Ball?: number
  required8Ball: boolean
  required9Ball: boolean
  absent: boolean
}

export interface Team {
  id: string
  name: string
  players: Player[]
  gameType: "8-Ball" | "9-Ball" | "Double-Jeopardy"
  ownerId?: string
  isShared?: boolean
}

export interface User {
  id: string
  username: string
  password: string
  email: string // recovery email
}

// Extend the next-auth session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
