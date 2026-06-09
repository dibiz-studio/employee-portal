import { Skeleton } from "@/shared/components/ui/skeleton";

export default function DepartmentsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
