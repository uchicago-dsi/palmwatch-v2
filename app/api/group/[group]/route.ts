import { fullYearRangeColumns } from "@/config/years";
import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(_req: Request, res: { params: { group: string } }) {
  const { group } = res.params;
  if (!group)
    return NextResponse.json(
      { error: new Error("No brand provided") },
      { status: 400 }
    );
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  const data = queryClient.getGroupInfo(group, fullYearRangeColumns);
  return NextResponse.json({ ...data }, { status: 200 });
}
