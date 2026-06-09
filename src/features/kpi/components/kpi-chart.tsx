"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface ChartDataPoint {
  label: string;
  value: number;
  target?: number;
}

interface KpiChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  variant?: "area" | "bar";
  valueLabel?: string;
}

export function KpiChart({
  title,
  description,
  data,
  variant = "area",
  valueLabel = "Progress %",
}: KpiChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            {variant === "area" ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={valueLabel}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                />
                {data[0]?.target !== undefined ? (
                  <Area
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="hsl(var(--muted-foreground))"
                    fill="transparent"
                    strokeDasharray="4 4"
                  />
                ) : null}
              </AreaChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar
                  dataKey="value"
                  name={valueLabel}
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
