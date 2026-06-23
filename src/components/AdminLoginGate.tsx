"use client";

import { useRouter } from "next/navigation";
import { AdminLogin } from "@/components/AdminLogin";

export function AdminLoginGate() {
  const router = useRouter();

  return <AdminLogin onSuccess={() => router.refresh()} />;
}
