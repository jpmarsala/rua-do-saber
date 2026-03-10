import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { AlunoDemoVideo } from "@/components/aluno/demo/AlunoDemoVideo";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return <AlunoDemoVideo />;
}

