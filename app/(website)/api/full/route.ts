import { NextResponse } from "next/server";
import { mergeFullShards } from "@/utils/bboxCompute";

export async function GET(req: Request) {
  const data = await mergeFullShards(req);
  return NextResponse.json(data, { status: 200 });
}
