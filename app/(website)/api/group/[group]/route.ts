import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { precomputedSlug } from "@/utils/precomputedSlug";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  if (!group)
    return NextResponse.json(
      { error: new Error("No brand provided") },
      { status: 400 }
    );
  const slug = precomputedSlug(decodeURIComponent(group));
  const data = await loadPrecomputedJson<Record<string, unknown>>(
    `group/${slug}-api.json`,
    req
  );
  return NextResponse.json({ ...data }, { status: 200 });
}
