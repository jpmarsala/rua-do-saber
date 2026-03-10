import { Suspense } from "react";
import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { GestorNav } from "./GestorNav";

export default async function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/entrar");
  return (
    <div className="flex min-h-0 flex-1 bg-streaming-bg">
      <aside className="w-56 shrink-0 border-r border-streaming-border bg-streaming-bg-elevated p-4 flex flex-col gap-2">
        <Suspense fallback={<div className="text-streaming-muted text-sm">...</div>}>
          <GestorNav />
        </Suspense>
      </aside>
      <div className="flex-1 p-6 text-streaming-text">{children}</div>
    </div>
  );
}
