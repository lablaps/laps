import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCollaborations,
  getCollaborationById,
  createCollaboration,
  deleteCollaboration,
} from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (id) {
      const collab = await getCollaborationById(id);
      if (!collab) {
        return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
      }
      return NextResponse.json(collab);
    }

    const collaborations = await getAllCollaborations();
    return NextResponse.json(collaborations);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('GET /api/collaborations error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Record<string, unknown>;

    // Validação
    if (!data.member_id_1 || !data.member_id_2 || data.strength === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: member_id_1, member_id_2, strength' },
        { status: 400 }
      );
    }

    const newCollab = await createCollaboration({
      member_id_1: data.member_id_1 as string,
      member_id_2: data.member_id_2 as string,
      collaboration_type: (data.collaboration_type as string) || 'collaboration',
      strength: data.strength as number,
      description: data.description as string | undefined,
      start_date: data.start_date as string | undefined,
      end_date: data.end_date as string | undefined,
      active: data.active !== false,
    });

    return NextResponse.json(newCollab, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('POST /api/collaborations error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deleteCollaboration(id);
    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('DELETE /api/collaborations error:', error);
    if (errorMessage.includes('not found')) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
