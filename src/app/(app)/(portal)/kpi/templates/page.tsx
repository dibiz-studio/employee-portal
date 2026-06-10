import Link from "next/link";
import { Plus } from "lucide-react";

import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getKpiTemplates } from "@/features/kpi/services/kpi.service";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { PageHeader } from "@/shared/components/data/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export default async function KpiTemplatesPage() {
  await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);
  const templates = await getKpiTemplates();

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="KPI Templates"
        description="Reusable performance goal templates"
        backHref="/kpi"
        backLabel="Back to KPI dashboard"
        actions={
          <Button asChild>
            <Link href="/kpi/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              New template
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All templates</CardTitle>
          <CardDescription>{templates.length} active templates</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Weight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      {template.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{template.category}</Badge>
                  </TableCell>
                  <TableCell>{template.period}</TableCell>
                  <TableCell>
                    {template.default_target ?? "—"} {template.measurement_unit}
                  </TableCell>
                  <TableCell>
                    {template.department?.name ?? "All"}
                  </TableCell>
                  <TableCell>{template.weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
