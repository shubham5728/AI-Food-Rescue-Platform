import { Leaf } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Leaf className="size-5" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">
        We could not find that page
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The donation may have been withdrawn, or the link may be out of date.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
