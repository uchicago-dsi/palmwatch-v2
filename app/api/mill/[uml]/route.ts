import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";
import path from "path";
export async function GET(_req: Request, res: { params: { uml: string } }) {
  const { uml } = res.params;
  // query param
  // const { millOnly } = _req.query;
  // search params from _req.url
  const url = new URL(_req.url);
  const millOnly = Boolean(url.searchParams.get("millOnly"));
  if (!uml)
    return NextResponse.json(
      { error: new Error("No uml provided") },
      { status: 400 }
    );
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);

  const info = queryClient.stringifyBigInts(queryClient.getUml(uml).objects());
  const brands = millOnly
    ? []
    : queryClient.stringifyBigInts(queryClient.getBrandUsage(uml));
  return NextResponse.json({ brands, info }, { status: 200 });
}
