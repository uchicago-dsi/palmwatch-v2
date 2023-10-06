import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";

export async function GET(_req: Request, res: { params: { uml: string } }) {
  const { uml } = res.params;
  if (!uml)
    return NextResponse.json(
      { error: new Error("No uml provided") },
      { status: 400 }
    );
  await queryClient.init();
  const brands = queryClient.stringifyBigInts(queryClient.getBrandUsage(uml));
  const info = queryClient.stringifyBigInts(queryClient.getUml(uml).objects())
  return NextResponse.json({ brands, info }, { status: 200 });
}
