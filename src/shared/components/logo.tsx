import Image from "next/image";

import { cn } from "@/shared/lib/utils";

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({ className, showSubtitle = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-500/30 bg-black/60 shadow-[0_0_0_1px_rgba(249,115,22,0.12)]">
        <Image
          src="/dibiz-logo.png"
          alt="Dibiz Studio"
          width={40}
          height={40}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-2xl font-bold tracking-tight text-orange-400">
          Dibiz<span className="text-foreground"> Studio</span>
        </span>
        {showSubtitle ? (
          <span className="truncate text-xs text-muted-foreground">
            Employee Management Portal
          </span>
        ) : null}
      </div>
    </div>
  );
}
