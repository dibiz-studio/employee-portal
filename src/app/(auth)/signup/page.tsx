import { Suspense } from "react";

import { SignupForm } from "@/features/auth/components/signup-form";
import { Skeleton } from "@/shared/components/ui/skeleton";

function SignupFormFallback() {
  return (
    <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormFallback />}>
      <SignupForm />
    </Suspense>
  );
}
