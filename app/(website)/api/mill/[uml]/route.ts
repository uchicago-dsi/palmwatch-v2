import { type NextRequest, NextResponse } from "next/server";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadMillApiPayload } from "@/server/mill-api-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uml: string }> }
) {
  const { uml } = await params;
  const url = new URL(req.url);
  const millOnly = !!url.searchParams.get("millOnly");
  if (!uml) {
    return NextResponse.json(
      { error: new Error("No uml provided") },
      { status: 400 }
    );
  }

  const decoded = decodeURIComponent(uml);
  if (decoded === "null" || decoded === "undefined" || decoded.trim() === "") {
    return NextResponse.json({ error: "Invalid mill id" }, { status: 400 });
  }

  const slug = precomputedSlug(decoded);
  const payload = await loadMillApiPayload(slug, req);
  if (!payload) {
    return NextResponse.json({ error: "Mill not found" }, { status: 404 });
  }

  const brands = millOnly ? [] : payload.brands;
  return NextResponse.json({ brands, info: payload.info });
}
