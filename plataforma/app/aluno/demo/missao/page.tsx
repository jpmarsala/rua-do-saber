import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { AlunoDemoMission } from "@/components/aluno/demo/AlunoDemoMission";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return <AlunoDemoMission />;
}

