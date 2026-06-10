import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getKpiSettings } from "@/features/settings/services/settings.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatusBadge } from "@/shared/components/data/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export default async function KpiSettingsPage() {
  // Define the shape of a KPI template returned from the service
  type KpiTemplate = {
    id: string;
    name: string;
    category: string;
    period: string;
    weight: number;
    default_target?: string;
    is_active: boolean;
  };

  await requireRole(["SUPER_ADMIN", "HR"]);
  const templates = await getKpiSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Settings"
        description="KPI template defaults and configuration."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Default Target</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template: KpiTemplate) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.category}</TableCell>
              <TableCell>{template.period}</TableCell>
              <TableCell>{template.weight}</TableCell>
              <TableCell>{template.default_target ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge
                  status={template.is_active ? "ACTIVE" : "TERMINATED"}
                  label={template.is_active ? "Active" : "Inactive"}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
