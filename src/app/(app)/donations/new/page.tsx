import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateDonationForm } from "@/app/(app)/donations/new/create-donation-form";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Add surplus food" };
export const dynamic = "force-dynamic";

export default async function NewDonationPage() {
  const { organisation } = await requireSession();

  // Recipients have no surplus to post; send them where they can act.
  if (organisation.role !== "donor") redirect("/dashboard");

  return (
    <div className="container max-w-3xl py-8">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-5">
        <Link href="/dashboard">
          <ArrowLeft className="size-4" aria-hidden />
          Back to dashboard
        </Link>
      </Button>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Add surplus food
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        The moment you submit, FoodBridge scores the waste risk, filters every
        verified recipient against your constraints, and ranks the ones that can
        actually collect in time.
      </p>

      <CreateDonationForm donor={organisation} className="mt-8" />
    </div>
  );
}
