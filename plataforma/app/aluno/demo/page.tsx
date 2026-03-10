import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { AlunoDemoHome } from "@/components/aluno/demo/AlunoDemoHome";

export default async function AlunoDemoPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return <AlunoDemoHome />;
}
