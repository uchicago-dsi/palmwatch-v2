import queryClient from "@/utils/getMillData";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { unparse } from "papaparse";
import { timestamp } from "@/utils/timestamp";
import { readFileSync } from "fs";
import { fullYearRangeColumns } from "@/config/years";

export async function GET(req: NextRequest, { params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const output = new URL(req.url).searchParams.get("output");
  if (!brand)
    return NextResponse.json(
      { error: new Error("No brand provided") },
      { status: 400 }
    );
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  const data = queryClient.getBrandInfo(brand, fullYearRangeColumns);

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
            "Content-Disposition": `attachment; filename="${brand}-Mills-${timestamp}.geojson"`,
          },
        }
      );
    case "loss":
      return new NextResponse(unparse(data.timeseries), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${brand}-Mills-${timestamp}.csv"`,
        },
      });
    case "mills":
      return new NextResponse(unparse(data.umlInfo), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${brand}-Mills-${timestamp}.csv"`,
        },
      });
    case "owners":
      return new NextResponse(unparse(data.owners), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${brand}-Mills-${timestamp}.csv"`,
        },
      });
    default:
      return NextResponse.json({ ...data }, { status: 200 });
  }
}
