import { Hono } from 'hono';
import { getUsersByName } from './getUser'; 
import { createServer } from 'http';

const app = new Hono();

app.get('/api/search', async (c) => {
  const userName = c.req.query('name');

  if (!userName) {
    return c.json({ message: 'Name query parameter is required' }, 400);
  }

  try {
    const users = await getUsersByName(userName);

    return c.json(users, 200);
  } catch (error) {
    console.error('Error searching users:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

