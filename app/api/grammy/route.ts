import { NextResponse } from "next/server";
import { db } from "@/db";
import { grammy } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const items = await db.select().from(grammy);
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch grammy" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newItem = await db.insert(grammy).values(body).returning();
        return NextResponse.json(newItem[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create grammy" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        const updatedItem = await db.update(grammy)
            .set(data)
            .where(eq(grammy.id, id))
            .returning();
        return NextResponse.json(updatedItem[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update grammy" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }
        await db.delete(grammy).where(eq(grammy.id, parseInt(id)));
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete grammy" }, { status: 500 });
    }
}