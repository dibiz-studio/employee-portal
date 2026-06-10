import { Skeleton } from "@/shared/components/ui/skeleton";

export default function KpiDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[420px] rounded-lg" />
        <Skeleton className="h-[420px] rounded-lg" />
      </div>
      <Skeleton className="h-[360px] rounded-lg" />
    </div>
  );
}
