import { readMillDataText } from "@/utils/readMillDataText";
import { resolveMillDataBase } from "@/utils/resolveMillDataBase";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { precomputedSlug } from "@/utils/precomputedSlug";
import { NextRequest, NextResponse } from "next/server";
import { unparse } from "papaparse";
import { timestamp } from "@/utils/timestamp";

export async function GET(req: NextRequest, { params }: { params: Promise<{ owner: string }> }) {
  const { owner: _owner } = await params;
  const owner = decodeURIComponent(_owner);
  const output = new URL(req.url).searchParams.get("output");
  if (!owner)
    return NextResponse.json(
      { error: new Error("No owner provided") },
      { status: 400 }
    );
  const dataDir = await resolveMillDataBase(req);
  const slug = precomputedSlug(owner);
  const data = await loadPrecomputedJson<{
    umlInfo: unknown[];
    timeseries: unknown[];
    brands: unknown[];
  }>(`owner/${slug}-api.json`, req);

  switch (output) {
    case "geo": {
      const geoDataRaw = await readMillDataText(dataDir, "mill-catchment.geojson");
      const geoData = JSON.parse(geoDataRaw);
      const features = [];
      for (const row of data.umlInfo as Record<string, unknown>[]) {
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
    }
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
