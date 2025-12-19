import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCollaborations,
  createCollaboration,
  deleteCollaboration,
  getAllMembers,
} from '@/lib/database';

export async function GET() {
  try {
    const collaborations = getAllCollaborations();
    const members = getAllMembers();

    // Converte IDs para objetos completos para o frontend
    const enrichedCollaborations = collaborations.map((collab) => ({
      ...collab,
      member1: members.find((m) => m.id === collab.memberId1),
      member2: members.find((m) => m.id === collab.memberId2),
    }));

    return NextResponse.json(enrichedCollaborations);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.memberId1 || !data.memberId2 || data.strength === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validar que membros existem
    const members = getAllMembers();
    if (
      !members.find((m) => m.id === data.memberId1) ||
      !members.find((m) => m.id === data.memberId2)
    ) {
      return NextResponse.json(
        { error: 'One or both members do not exist' },
        { status: 400 }
      );
    }

    const newCollab = createCollaboration({
      memberId1: data.memberId1,
      memberId2: data.memberId2,
      type: data.type || 'collaboration',
      strength: Math.max(1, Math.min(5, data.strength)),
      description: data.description,
    });

    return NextResponse.json(newCollab, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const deleted = deleteCollaboration(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
