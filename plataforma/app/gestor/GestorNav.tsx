"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function GestorNav() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const qs = tenantId ? `?tenantId=${tenantId}` : "";

  return (
    <>
      <p className="text-xs font-semibold text-streaming-muted uppercase tracking-wider mb-2">
        Gestor
      </p>
      <Link href={`/gestor${qs}`} className="text-sm font-medium text-streaming-muted hover:text-primary hover:text-white transition-colors">
        Dashboard
      </Link>
      <Link href={`/gestor/escolas${qs}`} className="text-sm font-medium text-streaming-muted hover:text-primary hover:text-white transition-colors">
        Escolas
      </Link>
      <Link href={`/gestor/professores${qs}`} className="text-sm font-medium text-streaming-muted hover:text-primary hover:text-white transition-colors">
        Professores
      </Link>
      <Link href={`/gestor/colecoes${qs}`} className="text-sm font-medium text-streaming-muted hover:text-primary hover:text-white transition-colors">
        Coleções
      </Link>
      <Link href={`/gestor/turmas${qs}`} className="text-sm font-medium text-streaming-muted hover:text-primary hover:text-white transition-colors">
        Turmas
      </Link>
      <Link href={`/gestor/relatorios${qs}`} className="text-sm font-medium text-streaming-muted hover:text-primary hover:text-white transition-colors">
        Relatórios
      </Link>
    </>
  );
}
