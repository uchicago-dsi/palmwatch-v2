import queryClient from "@/utils/getMillData";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { unparse } from "papaparse";
import { timestamp } from "@/utils/timestamp";
import { readFileSync } from "fs";
import { fullYearRangeColumns } from "@/config/years";

export async function GET(req: NextRequest, { params }: { params: Promise<{ owner: string }> }) {
  const { owner: _owner } = await params;
  const owner = decodeURIComponent(_owner);
  const output = new URL(req.url).searchParams.get("output");
  if (!owner)
    return NextResponse.json(
      { error: new Error("No owner provided") },
      { status: 400 }
    );
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  const data = queryClient.getOwnerInfo(owner, fullYearRangeColumns);

  switch (output) {
    case "geo":
      const geoDataRaw = await readFileSync(
        path.join(dataDir, "mill-catchment.geojson"),
        "utf8"
      );
      const geoData = JSON.parse(geoDataRaw);
      const features = [];
      for (const row of data.umlInfo) {
        const feature = geoData.features.find(
          // @ts-ignore
          (f: any) => f.properties["UML ID"] === row["UML ID"]
        );
        if (feature) {
          features.push({
            type: "Feature",
            geometry: feature.geometry,
            properties: row,
          });
        }
      }
      return NextResponse.json(
        { type: "FeatureCollection", features },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${owner}-Mills-${timestamp}.geojson"`,
          },
        }
      );
    case "loss":
      return new NextResponse(unparse(data.timeseries), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${owner}-Mills-${timestamp}.csv"`,
        },
      });
    case "mills":
      return new NextResponse(unparse(data.umlInfo), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${owner}-Mills-${timestamp}.csv"`,
        },
      });
    case "brands":
      return new NextResponse(unparse(data.brands), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${owner}-Brands-${timestamp}.csv"`,
        },
      });
    default:
      return NextResponse.json({ ...data }, { status: 200 });
  }
}
