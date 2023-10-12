import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(req: Request, _res: any) {
  const reqUrl = new URL(req.url);
  const [minLat, minLon, maxLat, maxLon] = [
    reqUrl.searchParams.get("minY"),
    reqUrl.searchParams.get("minX"),
    reqUrl.searchParams.get("maxY"),
    reqUrl.searchParams.get("maxX"),
  ];

  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  if ([minLat, minLon, maxLat, maxLon].some((v) => v === null)) {
    return NextResponse.json(
      { error: new Error("No bbox provided") },
      { status: 400 }
    );
  }

  const data = queryClient.getDataInBbox(
    minLat as any,
    minLon as any,
    maxLat as any,
    maxLon as any
  );
  return NextResponse.json({ ...data }, { status: 200 });
}
