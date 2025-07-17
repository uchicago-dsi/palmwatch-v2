import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  console.log(req);
  return NextResponse.json({ message: "Hello, world!" });
};