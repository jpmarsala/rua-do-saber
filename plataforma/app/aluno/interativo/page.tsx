import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { AlunoSliceLayout } from "@/components/aluno/slices/AlunoSliceLayout";
import { AlunoSliceNav } from "@/components/aluno/slices/AlunoSliceNav";

export default async function AlunoInterativoPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <AlunoSliceLayout
      leftSrc="/svg/slices/left-menu-interactive.svg"
      centerSrc="/svg/slices/center-session-interactive.svg"
      rightSrc="/svg/slices/right-menu-interactive.svg"
    >
      <AlunoSliceNav />
    </AlunoSliceLayout>
  );
}
