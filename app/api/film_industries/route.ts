import { NextResponse } from "next/server";
import { db } from "../../../src/db/index";
// import { db } from "../src/db/index.js";
import { film_industries } from "@/db/schema";
import { eq } from "drizzle-orm"; 

export async function GET() {
  try {
    const items = await db.select().from(film_industries);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch film_industries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = await db.insert(film_industries).values(body).returning();
    return NextResponse.json(newItem[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create film_industries" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const updatedItem = await db.update(film_industries)
      .set(data)
      .where(eq(film_industries.id, id))
      .returning();
    return NextResponse.json(updatedItem[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update film_industries" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await db.delete(film_industries).where(eq(film_industries.id, parseInt(id)));
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete film_industries" }, { status: 500 });
  }
}