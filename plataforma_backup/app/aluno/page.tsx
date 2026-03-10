export default function AlunoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Área do aluno</h1>
      <p className="text-slate-600 mb-6">
        Após o login: seu desenvolvimento (progresso, jogos e vídeos concluídos) e
        atividades disponíveis da sua turma.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        Faça login para acessar. Em breve: integração com Supabase Auth.
      </div>
    </div>
  );
}
