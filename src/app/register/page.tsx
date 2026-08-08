import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { RegisterClient } from "./register-client";

export const metadata: Metadata = { title: "Create a profile" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getSession()) redirect("/dashboard");

  return <RegisterClient />;
}

