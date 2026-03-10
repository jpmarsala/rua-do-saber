import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { AlunoSliceLayout } from "@/components/aluno/slices/AlunoSliceLayout";

export default async function AlunoDesignVideo() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return (
    <AlunoSliceLayout
      leftSrc="{base + left}"
      centerSrc="{base + center}"
      rightSrc="{base + right}"
    />
  );
}
