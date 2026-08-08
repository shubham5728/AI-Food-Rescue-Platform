import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="container space-y-8 py-8 animate-pulse">
      {/* Top Welcome Header Skeleton */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-3 w-full max-w-sm">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-5 w-3/4 rounded-md" />
        </div>
        <Skeleton className="h-12 w-40 rounded-md" />
      </header>

      {/* Main KPI Stat Tiles Skeleton */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="size-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Content Area Skeleton */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Priority Queue Skeleton */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-6 w-40 rounded-md" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5 bg-card/60">
                  <div className="flex gap-5">
                    <Skeleton className="w-14 h-16 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-48 rounded-md" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full rounded-md" />
                      <div className="flex gap-3 pt-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 flex-1 rounded-full" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 flex gap-4 bg-card/60">
                  <Skeleton className="size-20 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-4 w-16 rounded-md" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
