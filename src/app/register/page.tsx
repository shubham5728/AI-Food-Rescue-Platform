import { ArrowLeft, Leaf } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/app/register/register-form";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create a profile" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-4" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight">
              FoodBridge<span className="text-primary"> AI</span>
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">
              <ArrowLeft className="size-4" aria-hidden />
              Sign in instead
            </Link>
          </Button>
        </div>
      </header>

      <div className="container max-w-3xl py-10">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Create an organisation profile
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Donors post surplus food. Recipients describe what they can take, and the
          matching engine uses those constraints literally — capacity, diet,
          allergens, distance and how quickly you can mobilise a collection.
        </p>

        <RegisterForm className="mt-8" />
      </div>
    </div>
  );
}
