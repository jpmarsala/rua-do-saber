import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "teacher") redirect("/entrar");
  return <>{children}</>;
}
