import { NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { comments, users } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    // Parse JSON request body
    const { userId, filmId, username, content, email } = await req.json();

    console.log('Received payload:', { userId, filmId, username, content, email });

    // Validate required fields
    if (!userId || !filmId || !content || !email) {
      console.error('Missing required fields:', { userId, filmId, content, email });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure userId is treated as a string (Drizzle expects it as string)
    const userIdFormatted = String(userId); 

    // Check if user exists in the database
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, userIdFormatted)) // Ensure comparison is string-based
      .execute();

    console.log('User exists check result:', userExists);

    if (!userExists.length) {
      console.error('User does not exist:', userIdFormatted);
      return NextResponse.json({ error: 'User does not exist in the database' }, { status: 400 });
    }

    // Insert comment into the database
    await db.insert(comments).values({ 
      userId: userIdFormatted, 
      filmId, 
      content 
    });
    

    console.log('Comment successfully added for user:', userIdFormatted);

    return NextResponse.json({ message: 'Comment added successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
