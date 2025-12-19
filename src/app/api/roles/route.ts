import { NextResponse } from 'next/server';
import { getAllRoles } from '@/lib/supabase';

export async function GET() {
  try {
    const roles = await getAllRoles();
    return NextResponse.json(roles);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('GET /api/roles error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
