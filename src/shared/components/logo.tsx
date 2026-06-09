import { cn } from "@/shared/lib/utils";

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({ className, showSubtitle = false }: LogoProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-2xl font-bold text-primary">
        Dibiz<span className="text-foreground"> Studio</span>
      </span>
      {showSubtitle ? (
        <span className="text-xs text-muted-foreground">
          Employee Management Portal
        </span>
      ) : null}
    </div>
  );
}
