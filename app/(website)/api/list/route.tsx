import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(_req: Request) {
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  const searchList = queryClient.getSearchList();
  return NextResponse.json(searchList);
}
