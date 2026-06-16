import { NextResponse, type NextRequest } from "next/server";
import { getEodByMonth } from "@/features/eod/services/eod.service";
import { getServerProfile } from "@/features/auth/services/auth-server.service";

export async function GET(request: NextRequest) {
  const profile = await getServerProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const employeeId = searchParams.get("employeeId") || undefined;

  if (!year || !month) {
    return NextResponse.json({ error: "Missing year or month" }, { status: 400 });
  }

  try {
    const updates = await getEodByMonth(year, month, profile.role, profile.id, { employeeId });
    return NextResponse.json({ updates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 });
  }
}
