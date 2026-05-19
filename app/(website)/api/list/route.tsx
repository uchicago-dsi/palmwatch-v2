import { NextResponse } from "next/server";
import { emptySearchListPayload } from "@/domain";
import { loadSearchListPayload } from "@/server/search-list-data";

export async function GET(req: Request) {
  const searchList =
    (await loadSearchListPayload(req)) ?? emptySearchListPayload;
  return NextResponse.json(searchList);
}
