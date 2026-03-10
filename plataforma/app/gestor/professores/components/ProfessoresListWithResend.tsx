"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resendTeacherInvite } from "@/app/gestor/professores/actions";
import type { GestorTeacher } from "@/lib/gestor/dashboard-data";

export function ProfessoresListWithResend({
  teachers,
  tenantId,
}: {
  teachers: GestorTeacher[];
  tenantId: string | null;
}) {
  const router = useRouter();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<{ email: string; type: "ok" | "error"; text: string } | null>(null);

  async function handleResend(email: string) {
    if (!email || !tenantId) return;
    setMessage(null);
    setLoadingEmail(email);
    const result = await resendTeacherInvite(email, tenantId);
    setLoadingEmail(null);
    if (result.error) {
      setMessage({ email, type: "error", text: result.error });
    } else {
      setMessage({ email, type: "ok", text: "Convite reenviado com sucesso." });
    }
    router.refresh();
  }

  if (teachers.length === 0) {
    return <p className="text-slate-500">Nenhum professor cadastrado.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {teachers.map((t) => (
        <li key={t.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-medium text-slate-800">{t.full_name ?? "—"}</span>
            {t.email && <span className="text-slate-500 text-sm block">{t.email}</span>}
            {message?.email === t.email && (
              <p className={"text-sm mt-1 " + (message.type === "ok" ? "text-green-600" : "text-red-600")}>
                {message.text}
              </p>
            )}
          </div>
          {t.email && tenantId && (
            <button
              type="button"
              onClick={() => handleResend(t.email!)}
              disabled={loadingEmail === t.email}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              {loadingEmail === t.email ? "Enviando…" : "Reenviar convite"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
