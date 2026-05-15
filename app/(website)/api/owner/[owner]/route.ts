import { type NextRequest, NextResponse } from "next/server";
import { unparse } from "papaparse";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadOwnerApiDocument } from "@/lib/server/entity-api-data";
import { readMillDataText } from "@/lib/server/read-mill-data-text";
import { resolveMillDataBase } from "@/lib/server/resolve-mill-data-base";
import { timestamp } from "@/lib/timestamp";

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
      const features = [];
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
