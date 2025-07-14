import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  console.log('🔥 TEST AUTH: Starting test');
  
  try {
    // Test 1: Simple getServerSession call
    console.log('🔥 TEST AUTH: Calling getServerSession...');
    const session1 = await getServerSession(authOptions);
    console.log('🔥 TEST AUTH: Session result:', JSON.stringify(session1, null, 2));
    
    // Test 2: Check cookies
    const cookieHeader = request.headers.get('cookie');
    console.log('🔥 TEST AUTH: Cookie header:', cookieHeader);
    
    // Test 3: Environment variables
    console.log('🔥 TEST AUTH: NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('🔥 TEST AUTH: NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
    console.log('🔥 TEST AUTH: NODE_ENV:', process.env.NODE_ENV);
    
    return NextResponse.json({
      success: true,
      session: session1,
      hasCookies: !!cookieHeader,
      cookieHeader: cookieHeader,
      environment: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('🔥 TEST AUTH: Error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 