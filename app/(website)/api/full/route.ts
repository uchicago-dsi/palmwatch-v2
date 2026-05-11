import { mergeFullShards } from "@/utils/bboxCompute";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const data = await mergeFullShards(req);
  return NextResponse.json(data, { status: 200 });
}
