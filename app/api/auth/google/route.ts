import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/app/auth/core/oauth/base';
import { CookiesHandler } from '@/app/auth/core/session';

export async function GET(req: NextRequest) {
  // In App Router, you extract URL parameters like this:
  const url = new URL(req.url);
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  // Log the query for debugging
  console.log('Request query:', { state, code });

  // Check if query parameters exist
  if (!state || !code) {
    return NextResponse.json({ error: 'State or code missing' }, { status: 400 });
  }

  try {
    // Get the OAuth client for Google
    const googleOAuth = getOAuthClient("google");
    
    // Create the cookies handler with just the request object
    // This is sufficient for reading cookies (get method)
    const cookiesHandler = new CookiesHandler(req);
    
    // Use the fetchUser method to get the user details
    const user = await googleOAuth.fetchUser(code, state, cookiesHandler);
    
    // Create the response
    const response = NextResponse.json({ user }, { status: 200 });
    
    // If you need to set cookies after fetchUser, you can do it like this:
    // cookiesHandler.setResponse(response);
    // await createUserSession(user, cookiesHandler);
    
    return response;
  } catch (error) {
    // Handle errors (e.g., invalid state, token issues)
    console.error("OAuth error:", error);
    return NextResponse.json({ error: 'OAuth login failed' }, { status: 500 });
  }
}