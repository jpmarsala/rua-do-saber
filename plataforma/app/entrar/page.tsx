import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EntrarPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  switch (session.role) {
    case "super_admin":
    case "editor":
    case "support":
      redirect("/admin");
    case "manager":
      redirect("/gestor");
    case "teacher":
      redirect("/professor");
    case "student":
      redirect("/aluno");
    default:
      redirect("/auth/login");
  }
}
