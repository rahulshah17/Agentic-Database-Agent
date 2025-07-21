import { NextResponse } from "next/server";
        import { db } from "@/db"; 
        import { songs } from "@/db/schema";
        import { eq } from "drizzle-orm";

        export async function GET() {
        try {
            const items = await db.select().from(songs);
            return NextResponse.json(items);
        } catch (error) {
            return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
        }
        }

        export async function POST(request: Request) {
        try {
            const body = await request.json();
            const newItem = await db.insert(songs).values(body).returning();
            return NextResponse.json(newItem[0]);
        } catch (error) {
            return NextResponse.json({ error: "Failed to create songs" }, { status: 500 });
        }
        }

        export async function PUT(request: Request) {
        try {
            const body = await request.json();
            const { id, ...data } = body;
            const updatedItem = await db.update(songs)
            .set(data)
            .where(eq(songs.id, id))
            .returning();
            return NextResponse.json(updatedItem[0]);
        } catch (error) {
            return NextResponse.json({ error: "Failed to update songs" }, { status: 500 });
        }
        }

        export async function DELETE(request: Request) {
        try {
            const { searchParams } = new URL(request.url);
            const id = searchParams.get('id');
            if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
            }
            await db.delete(songs).where(eq(songs.id, parseInt(id)));
            return NextResponse.json({ message: "Deleted successfully" });
        } catch (error) {
            return NextResponse.json({ error: "Failed to delete songs" }, { status: 500 });
        }
        }