import { Skeleton } from "@/shared/components/ui/skeleton";

export default function AssignKpiLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-[480px] max-w-2xl rounded-lg" />
    </div>
  );
}
