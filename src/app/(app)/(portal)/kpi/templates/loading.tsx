import { Skeleton } from "@/shared/components/ui/skeleton";

export default function KpiTemplatesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}
