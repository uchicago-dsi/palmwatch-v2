import { type NextRequest, NextResponse } from "next/server";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadCountryPagePayload } from "@/lib/server/entity-page-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params;
  if (!country) {
    return NextResponse.json(
      { error: new Error("No brand provided") },
      { status: 400 }
    );
  }
  const slug = precomputedSlug(decodeURIComponent(country));
  const data = await loadCountryPagePayload(slug, req);
  if (!data) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 });
  }
  return NextResponse.json({ ...data }, { status: 200 });
}
