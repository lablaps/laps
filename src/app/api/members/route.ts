import { NextRequest, NextResponse } from 'next/server';
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (id) {
      const member = await getMemberById(id);
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      return NextResponse.json(member);
    }

    const members = await getAllMembers();
    return NextResponse.json(members);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('GET /api/members error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Record<string, unknown>;

    // Validação básica
    if (!data.name || !data.role_id || !data.bio) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role_id, bio' },
        { status: 400 }
      );
    }

    const newMember = await createMember({
      name: data.name as string,
      role_id: data.role_id as number,
      bio: data.bio as string,
      expertise: (data.expertise as string[]) || [],
      research_areas: (data.research_areas as string[]) || [],
      email: data.email as string | undefined,
      photo_url: data.photo_url as string | undefined,
      social_links: (data.social_links as Record<string, string>) || {},
      active: data.active !== false,
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('POST /api/members error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await request.json() as Record<string, unknown>;
    const updated = await updateMember(id, data);

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('PUT /api/members error:', error);
    if (errorMessage.includes('not found')) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
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

    await deleteMember(id);
    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('DELETE /api/members error:', error);
    if (errorMessage.includes('not found')) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
