import { GetServerSidePropsContext } from 'next';
import { getUserFromSession } from '@/app/auth/core/session';

export async function getServerSideAuth(context: GetServerSidePropsContext) {
  console.log('Starting getServerSideAuth function'); // Debugging log

  // Log the cookies from the request
  console.log('Cookies from request:', context.req.cookies); // Debugging log

  // Filter out undefined values from cookies
  const cookies: { [key: string]: string } = Object.fromEntries(
    Object.entries(context.req.cookies).filter(([_, value]) => value !== undefined) as [string, string][]
  );
  
  console.log('Filtered cookies (excluding undefined values):', cookies); // Debugging log

  // Pass the filtered cookies to getUserFromSession
  try {
    console.log('Attempting to get user from session with cookies:', cookies); // Debugging log
    const user = await getUserFromSession(cookies);
    console.log('User fetched from session:', user); // Debugging log
    return { user };
  } catch (error) {
    console.error('Error getting user from session:', error); // Debugging log for errors
    return { user: null }; // Fallback in case of error
  }
}
