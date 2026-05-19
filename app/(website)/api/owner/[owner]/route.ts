import { type NextRequest, NextResponse } from "next/server";
import { unparse } from "papaparse";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { timestamp } from "@/lib/timestamp";
import { loadOwnerApiDocument } from "@/server/entity-api-data";
import { readMillDataText } from "@/server/read-mill-data-text";
import { resolveMillDataBase } from "@/server/resolve-mill-data-base";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string }> }
) {
  const { owner: _owner } = await params;
  const owner = decodeURIComponent(_owner);
  const output = new URL(req.url).searchParams.get("output");
  if (!owner) {
    return NextResponse.json(
      { error: new Error("No owner provided") },
      { status: 400 }
    );
  }
  const dataDir = await resolveMillDataBase(req);
  const slug = precomputedSlug(owner);
  const data = await loadOwnerApiDocument(slug, req);
  if (!data) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  switch (output) {
    case "geo": {
      const geoDataRaw = await readMillDataText(
        dataDir,
        "mill-catchment.geojson"
      );
      const geoData = JSON.parse(geoDataRaw);
      const features: GeoJSON.Feature[] = [];
      for (const row of (data.umlInfo as
        | Record<string, unknown>[]
        | undefined) ?? []) {
        const feature = geoData.features.find(
          (f: { properties: Record<string, unknown> }) =>
            f.properties["UML ID"] === row["UML ID"]
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
      return new NextResponse(
        unparse((data.timeseries as unknown[] | undefined) ?? []),
        {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${owner}-Mills-${timestamp}.csv"`,
          },
        }
      );
    case "mills":
      return new NextResponse(
        unparse((data.umlInfo as unknown[] | undefined) ?? []),
        {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${owner}-Mills-${timestamp}.csv"`,
          },
        }
      );
    case "brands":
      return new NextResponse(
        unparse((data.brands as unknown[] | undefined) ?? []),
        {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${owner}-Brands-${timestamp}.csv"`,
          },
        }
      );
    default:
      return NextResponse.json({ ...data }, { status: 200 });
  }
}
