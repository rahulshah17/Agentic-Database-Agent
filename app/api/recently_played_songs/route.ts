import { NextResponse } from "next/server";
import { db } from "@/db"; 
import { recently_played_songs } from "@/db/schema";

export async function GET() {
  try {
    const items = await db.select().from(recently_played_songs);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch recently_played_songs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = await db.insert(recently_played_songs).values(body).returning();
    return NextResponse.json(newItem[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create recently_played_songs" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const updatedItem = await db.update(recently_played_songs)
      .set(data)
      .where(eq(recently_played_songs.id, id))
      .returning();
    return NextResponse.json(updatedItem[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update recently_played_songs" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await db.delete(recently_played_songs).where(eq(recently_played_songs.id, parseInt(id)));
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete recently_played_songs" }, { status: 500 });
  }
}