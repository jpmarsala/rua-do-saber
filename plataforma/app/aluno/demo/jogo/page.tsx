import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { AlunoDemoMemory } from "@/components/aluno/demo/AlunoDemoMemory";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return <AlunoDemoMemory />;
}

