export const dynamic = "force-dynamic";
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server'; 
import { getAllFilms } from '@/app/api/getFilms';

export async function GET(request: NextRequest) { 
  try {
  
    const url = new URL(request.url);
    
    const branch = url.searchParams.get('branch') || 'main';
    

    const films = await getAllFilms(branch);
    
    return NextResponse.json(films, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error fetching films:", error);
    return NextResponse.json({ error: 'Failed to fetch films' }, { status: 500 });
  }
}