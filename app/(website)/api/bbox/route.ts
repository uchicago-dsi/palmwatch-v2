import { computeBboxPayload } from "@/utils/bboxCompute";
import { NextResponse } from "next/server";

export async function GET(req: Request, _res: unknown) {
  const reqUrl = new URL(req.url);
  const [minLat, minLon, maxLat, maxLon] = [
    reqUrl.searchParams.get("minY"),
    reqUrl.searchParams.get("minX"),
    reqUrl.searchParams.get("maxY"),
    reqUrl.searchParams.get("maxX"),
  ];

  if ([minLat, minLon, maxLat, maxLon].some((v) => v === null)) {
    return NextResponse.json(
      { error: new Error("No bbox provided") },
      { status: 400 }
    );
  }

  const data = await computeBboxPayload(
    req,
    Number(minLat),
    Number(minLon),
    Number(maxLat),
    Number(maxLon)
  );
  return NextResponse.json({ ...data }, { status: 200 });
}
