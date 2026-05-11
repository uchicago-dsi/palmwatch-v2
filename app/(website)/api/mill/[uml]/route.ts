import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { precomputedSlug } from "@/utils/precomputedSlug";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ uml: string }> }) {
  const { uml } = await params;
  const url = new URL(req.url);
  const millOnly = !!(url.searchParams.get("millOnly"));
  if (!uml)
    return NextResponse.json(
      { error: new Error("No uml provided") },
      { status: 400 }
    );

  const decoded = decodeURIComponent(uml);
  if (
    decoded === "null" ||
    decoded === "undefined" ||
    decoded.trim() === ""
  ) {
    return NextResponse.json({ error: "Invalid mill id" }, { status: 400 });
  }

  const slug = precomputedSlug(decoded);
  const payload = await loadPrecomputedJson<{
    brands: unknown[];
    info: unknown[];
  }>(`mill/${slug}.json`, req);

  const brands = millOnly ? [] : payload.brands;
  return NextResponse.json({ brands, info: payload.info });
}
