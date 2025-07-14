import { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request additional GitHub permissions for repository access
          scope: 'read:user user:email repo'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.githubId = profile?.id
        token.username = profile?.login
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.accessToken = token.accessToken
        session.user.githubId = token.githubId as number
        session.user.username = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  }
} 