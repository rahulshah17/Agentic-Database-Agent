import { NextResponse } from "next/server";
        import { db } from "@/db"; 
        import { popular_albums } from "@/db/schema";
        import { eq } from "drizzle-orm";

        export async function GET() {
        try {
            const items = await db.select().from(popular_albums);
            return NextResponse.json(items);
        } catch (error) {
            return NextResponse.json({ error: "Failed to fetch popular_albums" }, { status: 500 });
        }
        }

        export async function POST(request: Request) {
        try {
            const body = await request.json();
            const newItem = await db.insert(popular_albums).values(body).returning();
            return NextResponse.json(newItem[0]);
        } catch (error) {
            return NextResponse.json({ error: "Failed to create popular_albums" }, { status: 500 });
        }
        }

        export async function PUT(request: Request) {
        try {
            const body = await request.json();
            const { id, ...data } = body;
            const updatedItem = await db.update(popular_albums)
            .set(data)
            .where(eq(popular_albums.id, id))
            .returning();
            return NextResponse.json(updatedItem[0]);
        } catch (error) {
            return NextResponse.json({ error: "Failed to update popular_albums" }, { status: 500 });
        }
        }

        export async function DELETE(request: Request) {
        try {
            const { searchParams } = new URL(request.url);
            const id = searchParams.get('id');
            if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
            }
            await db.delete(popular_albums).where(eq(popular_albums.id, parseInt(id)));
            return NextResponse.json({ message: "Deleted successfully" });
        } catch (error) {
            return NextResponse.json({ error: "Failed to delete popular_albums" }, { status: 500 });
        }
        }