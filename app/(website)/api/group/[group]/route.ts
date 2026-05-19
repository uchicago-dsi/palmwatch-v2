import { type NextRequest, NextResponse } from "next/server";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadGroupApiDocument } from "@/server/entity-api-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ group: string }> }
) {
  const { group } = await params;
  if (!group) {
    return NextResponse.json(
      { error: new Error("No brand provided") },
      { status: 400 }
    );
  }
  const slug = precomputedSlug(decodeURIComponent(group));
  const data = await loadGroupApiDocument(slug, req);
  if (!data) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  return NextResponse.json({ ...data }, { status: 200 });
}
