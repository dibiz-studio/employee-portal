import { Logo } from "@/shared/components/logo";
import { APP_TAGLINE } from "@/shared/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Logo showSubtitle />
        <p className="max-w-sm text-sm text-muted-foreground">{APP_TAGLINE}</p>
      </div>
      {children}
    </div>
  );
}
