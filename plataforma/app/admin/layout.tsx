import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "super_admin" && session.role !== "editor" && session.role !== "support") redirect("/entrar");
  return (
    <div className="flex min-h-0 flex-1 bg-streaming-bg">
      <aside className="w-56 shrink-0 border-r border-streaming-border bg-streaming-bg-elevated p-4 flex flex-col gap-2">
        <p className="text-xs font-semibold text-streaming-muted uppercase tracking-wider mb-2">
          Admin
        </p>
        <Link href="/admin" className="text-sm font-medium text-streaming-muted hover:text-primary hover:text-white transition-colors">
          Dashboard
        </Link>
        <Link href="/admin/clientes" className="text-sm font-medium text-streaming-muted hover:text-primary hover:text-white transition-colors">
          Clientes
        </Link>
        <Link href="/admin/aulas" className="text-sm font-medium text-streaming-muted hover:text-primary hover:text-white transition-colors">
          Aulas
        </Link>
      </aside>
      <div className="flex-1 p-6 text-streaming-text">{children}</div>
    </div>
  );
}
