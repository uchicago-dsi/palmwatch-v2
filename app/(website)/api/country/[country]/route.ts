import { type NextRequest, NextResponse } from "next/server";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { precomputedSlug } from "@/utils/precomputedSlug";

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
  const data = await loadPrecomputedJson<Record<string, unknown>>(
    `country/${slug}.json`,
    req
  );
  return NextResponse.json({ ...data }, { status: 200 });
}
