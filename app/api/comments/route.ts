import { NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { comments, users } from '@/app/db/schema';
import { eq, desc } from 'drizzle-orm';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filmId = searchParams.get('filmId');
  
  if (!filmId) {
    return NextResponse.json({ error: 'Film ID is required' }, { status: 400 });
  }

  try {
    const fetchedComments = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        username: users.name,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.filmId, parseInt(filmId)))
      .orderBy(desc(comments.createdAt));

    const formattedComments = fetchedComments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      username: comment.username || 'Anonymous',
    }));

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {

    const { userId, filmId, username, content, email } = await req.json();

    console.log('Received payload:', { userId, filmId, username, content, email });


    if (!userId || !filmId || !content || !email) {
      console.error('Missing required fields:', { userId, filmId, content, email });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }


    const userIdFormatted = String(userId); 


    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, userIdFormatted)) 
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
