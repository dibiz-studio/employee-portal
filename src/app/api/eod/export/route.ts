import { NextResponse, type NextRequest } from "next/server";
import * as xlsx from "xlsx";
import { getEodByMonth } from "@/features/eod/services/eod.service";
import { getServerProfile } from "@/features/auth/services/auth-server.service";

export async function GET(request: NextRequest) {
  const profile = await getServerProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile.role !== "HR" && profile.role !== "SUPER_ADMIN") {
     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const monthParam = searchParams.get("month"); // expected format: "YYYY-MM"
  const employeeId = searchParams.get("employeeId") || undefined;

  if (!monthParam) {
    return NextResponse.json({ error: "Missing month" }, { status: 400 });
  }

  const [year, month] = monthParam.split("-");

  try {
    const updates = await getEodByMonth(year, month, profile.role, profile.id, { employeeId });
    
    // Map data for Excel export
    const excelData = updates.map((update) => ({
      "Date": update.report_date,
      "Employee": update.employee_name,
      "Brand": update.brand?.name || "N/A",
      "Hours": update.hours_worked,
      "Tasks Completed": Array.isArray(update.tasks_completed) ? update.tasks_completed.join("; ") : update.tasks_completed,
      "Blockers": update.blockers || "None",
      "Tomorrow's Plan": update.tomorrow_plan || "None",
      "Manager Comment": update.manager_comment || "None",
      "Status": update.reviewed_at ? "Reviewed" : "Pending",
    }));

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "EOD_Updates");

    // Write buffer
    const buf = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Stream back
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="EOD_Archive_${year}_${month}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to export archive" }, { status: 500 });
  }
}
