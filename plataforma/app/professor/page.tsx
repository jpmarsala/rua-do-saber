import Link from "next/link";

export default function ProfessorPage() {
  return (
    <div className="text-streaming-text">
      <h1 className="text-2xl font-display font-bold text-streaming-text mb-2">Área do professor</h1>
      <p className="text-streaming-muted mb-6">Biblioteca de aulas e turmas sob sua responsabilidade.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/professor/aulas"
          className="block p-6 rounded-xl border border-streaming-border bg-streaming-bg-card hover:border-primary text-streaming-text"
        >
          <h2 className="font-display font-semibold text-streaming-text mb-1">Biblioteca de aulas</h2>
          <p className="text-streaming-muted text-sm">Ver aulas disponíveis e marcar como aplicadas.</p>
        </Link>
        <Link
          href="/professor/controle-aula"
          className="block p-6 rounded-xl border border-streaming-border bg-streaming-bg-card hover:border-primary text-streaming-text"
        >
          <h2 className="font-display font-semibold text-streaming-text mb-1">Controle da aula</h2>
          <p className="text-streaming-muted text-sm">Introdução concluída, Atividade concluída e validar missões.</p>
        </Link>
        <Link
          href="/professor/turmas"
          className="block p-6 rounded-xl border border-streaming-border bg-streaming-bg-card hover:border-primary text-streaming-text"
        >
          <h2 className="font-display font-semibold text-streaming-text mb-1">Escolas e turmas</h2>
          <p className="text-streaming-muted text-sm">Cadastrar e editar turmas e alunos das suas escolas.</p>
        </Link>
      </div>
    </div>
  );
}
