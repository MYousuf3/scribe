declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      githubId?: number
      username?: string
    }
  }

  interface Profile {
    id?: string | number
    login?: string
    avatar_url?: string
    name?: string
    email?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    githubId?: string | number
    username?: string
  }
} 