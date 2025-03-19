export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server'; 
import { getAllFilms } from '@/app/api/getFilms';

export async function GET(request: NextRequest) { 
  try {
  
    const url = new URL(request.url);
    
    const branch = url.searchParams.get('branch') || 'main';
    

    const films = await getAllFilms(branch);
    
    return NextResponse.json(films);
  } catch (error) {
    console.error("Error fetching films:", error);
    return NextResponse.json({ error: 'Failed to fetch films' }, { status: 500 });
  }
}