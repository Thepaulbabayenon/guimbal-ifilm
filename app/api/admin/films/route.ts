import { NextResponse } from 'next/server';
import { getAllFilms } from '@/app/api/getFilms'; // Adjust path based on your project structure

export async function GET() {
  try {
    const films = await getAllFilms();
    return NextResponse.json(films);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch films' }, { status: 500 });
  }
}
