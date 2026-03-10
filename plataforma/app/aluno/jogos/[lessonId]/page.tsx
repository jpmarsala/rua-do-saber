import Link from "next/link";

export default async function AlunoJogoPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/aluno/aulas" className="hover:text-slate-700">Aulas</Link>
        <span className="mx-2">/</span>
        <Link href={`/aluno/aulas/${lessonId}`} className="hover:text-slate-700">Aula</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Jogo</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Jogo da aula</h1>
      <p className="text-slate-600 mb-6">O jogo interativo será implementado em breve. Quando concluir, volte à aula e clique em &quot;Concluí o jogo&quot;.</p>
      <Link href={`/aluno/aulas/${lessonId}`} className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90">Voltar à aula</Link>
    </div>
  );
}
