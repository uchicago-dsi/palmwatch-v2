import { NextResponse } from "next/server";
import { mergeFullShards } from "@/lib/server/bbox-compute";

export async function GET(req: Request) {
  const data = await mergeFullShards(req);
  return NextResponse.json(data, { status: 200 });
}
