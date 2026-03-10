import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AlunoDesignIndex() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return (
    <div className="min-h-screen flex items-center justify-center gap-4 flex-wrap p-8 font-kalitha" style={{ backgroundColor: "var(--rua-dark)" }}>
      <Link href="/aluno/design/home" className="px-6 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: "var(--rua-slate)" }}>Home</Link>
      <Link href="/aluno/design/video" className="px-6 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: "var(--rua-slate)" }}>Vídeo</Link>
      <Link href="/aluno/design/interactive" className="px-6 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: "var(--rua-slate)" }}>Interativo</Link>
      <Link href="/aluno/design/mission" className="px-6 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: "var(--rua-slate)" }}>Missão</Link>
    </div>
  );
}
