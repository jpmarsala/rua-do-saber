import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { AlunoSliceLayout } from "@/components/aluno/slices/AlunoSliceLayout";
import { AlunoSliceNav } from "@/components/aluno/slices/AlunoSliceNav";

export default async function AlunoMissaoPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <AlunoSliceLayout
      leftSrc="/svg/slices/left-menu-mission.svg"
      centerSrc="/svg/slices/center-session-mission.svg"
      rightSrc="/svg/slices/right-mennu-mission.svg"
    >
      <AlunoSliceNav />
    </AlunoSliceLayout>
  );
}
