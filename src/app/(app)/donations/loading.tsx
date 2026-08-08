import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DonationsLoading() {
  return (
    <div className="container space-y-8 py-8 animate-pulse">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-md" />
          <Skeleton className="h-5 w-48 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 flex flex-col gap-4 bg-card/60">
            <div className="flex gap-4">
              <Skeleton className="size-20 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            </div>
            <div className="flex justify-between gap-2 pt-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
