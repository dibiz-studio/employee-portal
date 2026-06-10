"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  backHref?: string;
  backLabel?: string;
  hideBack?: boolean;
}

function humanize(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getDefaultBack(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;
  return `/${segments.slice(0, -1).join("/")}`;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  backHref,
  backLabel,
  hideBack = false,
}: PageHeaderProps) {
  const pathname = usePathname();
  const resolvedBackHref = backHref ?? getDefaultBack(pathname);
  const resolvedBackLabel =
    backLabel ??
    (resolvedBackHref
      ? `Back to ${humanize(resolvedBackHref.split("/").filter(Boolean).slice(-1)[0] ?? "previous")}`
      : "Back");

  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      <div className="space-y-3">
        {resolvedBackHref && !hideBack ? (
          <Link
            href={resolvedBackHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-orange-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {resolvedBackLabel}
          </Link>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-orange-50">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
