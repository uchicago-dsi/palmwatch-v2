import type { SearchListPayload } from "@/types/searchList";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const searchList = await loadPrecomputedJson<SearchListPayload>(
    "search-list.json",
    req
  );
  return NextResponse.json(searchList);
}
