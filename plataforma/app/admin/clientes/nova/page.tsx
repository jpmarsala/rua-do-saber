import Link from "next/link";
import { NovoClienteForm } from "./NovoClienteForm";

export default function AdminClientesNovaPage() {
  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/admin/clientes" className="hover:text-slate-700 text-primary">Clientes</Link>
        <span className="mx-2">/</span>
        <span className="text-white font-medium">Novo cliente</span>
      </nav>
      <h1 className="text-2xl font-bold text-white mb-2">Novo cliente</h1>
      <p className="text-streaming-muted mb-6">
        Cadastre um novo cliente (tenant). Depois você pode atribuir coleções na página do cliente.
      </p>
      <NovoClienteForm />
    </div>
  );
}
