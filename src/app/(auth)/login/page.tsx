import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import { Skeleton } from "@/shared/components/ui/skeleton";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
