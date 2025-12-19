import { NextRequest, NextResponse } from 'next/server';
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  TeamMember,
} from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (id) {
      const member = getMemberById(id);
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      return NextResponse.json(member);
    }

    const members = getAllMembers();
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validação básica
    if (!data.name || !data.role || !data.bio) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, bio' },
        { status: 400 }
      );
    }

    const newMember = createMember({
      name: data.name,
      role: data.role,
      bio: data.bio,
      expertise: data.expertise || [],
      researchAreas: data.researchAreas || [],
      email: data.email,
      image: data.image,
      active: data.active !== false,
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await request.json();
    const updated = updateMember(id, data);

    if (!updated) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
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

    const deleted = deleteMember(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
