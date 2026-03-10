import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/entrar");
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col justify-end pb-16 pt-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-t from-streaming-bg via-streaming-bg/80 to-transparent z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(22,163,74,0.2),transparent)] z-0" />
        <div className="container mx-auto relative z-10 max-w-4xl">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight text-white mb-4">
            Educação no Trânsito
          </h1>
          <p className="text-xl text-streaming-muted max-w-2xl mb-8">
            Programa municipal para o ensino fundamental. Vídeos, jogos e atividades para a sala de aula.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/t/demo"
              className="inline-flex items-center gap-2 rounded px-6 py-3 bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Ver programa
            </Link>
            <Link
              href="/professor"
              className="inline-flex items-center gap-2 rounded px-6 py-3 bg-streaming-bg-card border border-streaming-border text-streaming-text font-medium hover:bg-streaming-bg-elevated transition-colors"
            >
              Área do professor
            </Link>
            <Link
              href="/aluno"
              className="inline-flex items-center gap-2 rounded px-6 py-3 bg-streaming-bg-card border border-streaming-border text-streaming-text font-medium hover:bg-streaming-bg-elevated transition-colors"
            >
              Área do aluno
            </Link>
            <Link
              href="/gestor"
              className="inline-flex items-center gap-2 rounded px-6 py-3 bg-streaming-bg-card border border-streaming-border text-streaming-text font-medium hover:bg-streaming-bg-elevated transition-colors"
            >
              Área do gestor
            </Link>
          </div>
        </div>
      </section>

      {/* Content rows */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="font-display text-2xl md:text-3xl tracking-tight text-white mb-6">O que você encontra</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-streaming-bg-card border border-streaming-border p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 font-display text-xl">1</div>
            <h3 className="font-semibold text-white mb-2">Episódios</h3>
            <p className="text-streaming-muted text-sm">
              Programa anual com vídeos e guias para o professor.
            </p>
          </div>
          <div className="rounded-xl bg-streaming-bg-card border border-streaming-border p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 font-display text-xl">2</div>
            <h3 className="font-semibold text-white mb-2">Jogos</h3>
            <p className="text-streaming-muted text-sm">
              Reforço lúdico com quiz, memória e mais.
            </p>
          </div>
          <div className="rounded-xl bg-streaming-bg-card border border-streaming-border p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 font-display text-xl">3</div>
            <h3 className="font-semibold text-white mb-2">Acompanhamento</h3>
            <p className="text-streaming-muted text-sm">
              Professor e gestor acompanham o uso na escola.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
