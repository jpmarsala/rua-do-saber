import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { AlunoSliceLayout } from "@/components/aluno/slices/AlunoSliceLayout";
import { AlunoSliceNav } from "@/components/aluno/slices/AlunoSliceNav";
import { VideoPlayOverlay } from "@/components/aluno/slices/VideoPlayOverlay";

export default async function AlunoVideoPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <AlunoSliceLayout
      leftSrc="/svg/slices/right-menu-video.svg"
      centerSrc="/svg/slices/center-session-video.svg"
      rightSrc="/svg/slices/left-menu-video.svg"
      centerOverlay={<VideoPlayOverlay />}
    >
      <AlunoSliceNav />
    </AlunoSliceLayout>
  );
}
