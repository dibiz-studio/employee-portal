import Link from "next/link";
import { ShieldX } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="h-6 w-6" aria-hidden />
          </div>
          <CardTitle className="text-2xl">Access denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to view this page. Contact your
            administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
