import { Skeleton } from "@/shared/components/ui/skeleton";

export default function NewEmployeeLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-72 rounded-lg" />
    </div>
  );
}
