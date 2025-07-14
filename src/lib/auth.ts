import GitHubProvider from 'next-auth/providers/github'
import connectToDatabase from './mongodb'
import User from '../models/User'

export const authOptions = {
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
    async signIn({ account, profile }: any) {
      try {
        // Connect to database
        await connectToDatabase();
        
        // Create or update user in database
        if (account?.provider === 'github' && profile) {
          await User.findOneAndUpdate(
            { github_id: profile.id },
            {
              github_id: profile.id,
              username: profile.login,
              email: profile.email,
              name: profile.name,
              avatar_url: profile.avatar_url,
              access_token: account.access_token,
              updated_at: new Date()
            },
            { 
              upsert: true, // Create if doesn't exist
              new: true 
            }
          );
          
          console.log('🔍 Auth Debug: User created/updated in database:', profile.login);
        }
        
        return true;
      } catch (error) {
        console.error('🔍 Auth Debug: Error in signIn callback:', error);
        return true; // Don't block signin if database fails
      }
    },
    async jwt({ token, account, profile }: any) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.githubId = profile?.id
        token.username = profile?.login
      }
      return token
    },
    async session({ session, token }: any) {
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
    strategy: 'jwt' as const
  }
} 