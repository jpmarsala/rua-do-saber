import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { AlunoSliceLayout } from "@/components/aluno/slices/AlunoSliceLayout";
import Link from "next/link";
import { AlunoSliceNav } from "@/components/aluno/slices/AlunoSliceNav";

export default async function AlunoPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <AlunoSliceLayout
      leftSrc="/svg/slices/left-menu-home.svg"
      centerSrc="/svg/slices/center-session-home.svg"
      rightSrc="/svg/slices/right-menu-home.svg"
      centerOverlay={
        <Link
          href="/aluno/video"
          className="absolute bottom-[18%] left-1/2 -translate-x-1/2 block w-44 h-44 rounded-full z-10"
          aria-label="Ir para aula em vídeo (botão 2)"
        />
      }
    >
      <AlunoSliceNav />
    </AlunoSliceLayout>
  );
}
