"use client";

import dynamic from "next/dynamic";

export const DynamicFoodMap = dynamic(
  () => import("./food-map").then((mod) => mod.FoodMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center rounded-xl border border-border bg-muted/30">
        <div className="flex flex-col items-center gap-2">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-medium text-muted-foreground">
            Loading Ahmedabad Real Map...
          </span>
        </div>
      </div>
    ),
  },
);

export type { MapMarkerItem, MapRouteItem } from "./food-map";
