import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/app/db/drizzle'; // Corrected import based on your schema
import { users } from '@/app/db/schema';
import { UserJSON } from '@/app/db/schema'; // Import the UserJSON type you defined earlier

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', { status: 400 });
  }

  // Narrowing the type of evt.data to UserJSON if event type is 'user.created'
  if (evt.type === 'user.created') {
    const userData = evt.data as UserJSON; // Type assertion to UserJSON

    const { id, email_addresses, image_url, name } = userData;

    // Check if email_addresses exist and has at least one email address
    if (!email_addresses || email_addresses.length === 0) {
      return new Response('Missing email_addresses in webhook data', { status: 400 });
    }

    // Insert user data into the database
    try {
      await db.insert(users).values({
        id,
        email: email_addresses[0].email_address, // Ensure the correct field name
        image: image_url || '', // Default to empty string if image_url is not provided
        name: name || '', // Default to empty string if name is not provided
      });
      console.log('New user added to the database with ID:', id);
    } catch (error) {
      console.error('Error adding user to the database:', error);
      return new Response('Database error', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
