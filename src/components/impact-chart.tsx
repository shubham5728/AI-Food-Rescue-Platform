"use client";

import { BarChart3, Table2 } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImpactTimePoint } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

/**
 * One measure at a time, on one axis.
 *
 * Meals, kilograms and donation counts have unrelated scales, so they get a
 * segmented control rather than a second y-axis. The table view is not
 * optional decoration: the amber series sits below 3:1 against the card
 * surface, and a readable table is the required relief.
 */

const METRICS = [
  {
    key: "meals" as const,
    label: "Meals rescued",
    unit: "meals",
    color: "var(--chart-meals)",
  },
  {
    key: "kg" as const,
    label: "Food saved",
    unit: "kg",
    color: "var(--chart-kg)",
  },
  {
    key: "completed" as const,
    label: "Donations completed",
    unit: "donations",
    color: "var(--chart-completed)",
  },
  {
    key: "at_risk" as const,
    label: "Meals at risk",
    unit: "meals",
    color: "var(--chart-risk)",
  },
];

type MetricKey = (typeof METRICS)[number]["key"];

interface ImpactChartProps {
  data: ImpactTimePoint[];
  className?: string;
}

export function ImpactChart({ data, className }: ImpactChartProps) {
  const [metricKey, setMetricKey] = useState<MetricKey>("meals");
  const [view, setView] = useState<"chart" | "table">("chart");

  const metric = METRICS.find((m) => m.key === metricKey)!;
  const total = data.reduce((sum, point) => sum + point[metric.key], 0);
  const hasData = total > 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="gap-4 border-b border-border bg-muted/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{metric.label} over time</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Last {data.length} days ·{" "}
              <span className="tabular font-medium text-foreground">
                {formatNumber(total)} {metric.unit}
              </span>{" "}
              in total
            </p>
          </div>

          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={view === "chart"}
              onClick={() => setView("chart")}
              className={cn("h-7 px-2", view === "chart" && "bg-muted")}
            >
              <BarChart3 className="size-3.5" aria-hidden />
              Chart
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={view === "table"}
              onClick={() => setView("table")}
              className={cn("h-7 px-2", view === "table" && "bg-muted")}
            >
              <Table2 className="size-3.5" aria-hidden />
              Table
            </Button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Impact measure"
          className="flex flex-wrap gap-1.5"
        >
          {METRICS.map((m) => {
            const active = m.key === metricKey;
            return (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMetricKey(m.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-transparent bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: m.color }}
                  aria-hidden
                />
                {m.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {!hasData ? (
          <div className="flex h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
            <p className="text-sm font-medium">No {metric.label.toLowerCase()} yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              This measure will fill in as donations move through the lifecycle.
            </p>
          </div>
        ) : view === "chart" ? (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 4, bottom: 0, left: -16 }}
                barCategoryGap={2}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--chart-grid)"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "var(--chart-grid)" }}
                  tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                  interval={Math.max(0, Math.floor(data.length / 8) - 1)}
                  minTickGap={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--chart-grid)", fillOpacity: 0.4 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lift">
                        <p className="text-xs font-medium text-muted-foreground">
                          {label}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: metric.color }}
                            aria-hidden
                          />
                          <span className="tabular">
                            {formatNumber(Number(payload[0].value))}
                          </span>
                          <span className="font-normal text-muted-foreground">
                            {metric.unit}
                          </span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey={metric.key}
                  fill={metric.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={26}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="max-h-[260px] overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <caption className="sr-only">
                {metric.label} per day for the last {data.length} days
              </caption>
              <thead className="sticky top-0 bg-muted text-left">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    {metric.label} ({metric.unit})
                  </th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((point) => point[metric.key] > 0)
                  .map((point) => (
                    <tr key={point.date} className="border-t border-border">
                      <td className="px-3 py-1.5">{point.label}</td>
                      <td className="tabular px-3 py-1.5 text-right font-medium">
                        {formatNumber(point[metric.key])}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
