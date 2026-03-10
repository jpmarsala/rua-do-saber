import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Educação no Trânsito
        </h1>
        <p className="text-lg text-slate-600 mb-6">
          Programa municipal de educação no trânsito para crianças do ensino
          fundamental. Vídeos, jogos e atividades para a sala de aula.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/t/demo"
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90"
          >
            Ver programa (demo)
          </Link>
          <Link
            href="/professor"
            className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-100"
          >
            Área do professor
          </Link>
          <Link
            href="/aluno"
            className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-100"
          >
            Área do aluno
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-2">Episódios</h2>
          <p className="text-slate-600 text-sm">
            Programa anual com vídeos e guias para o professor.
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-2">Jogos</h2>
          <p className="text-slate-600 text-sm">
            Reforço lúdico com decisões, quiz, memória e mais.
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-2">Acompanhamento</h2>
          <p className="text-slate-600 text-sm">
            Professor e gestor acompanham o uso na escola.
          </p>
        </div>
      </section>
    </div>
  );
}
