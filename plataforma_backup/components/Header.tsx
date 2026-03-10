"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Início" },
  { href: "/professor", label: "Professor" },
  { href: "/aluno", label: "Aluno" },
  { href: "/gestor", label: "Gestor" },
  { href: "/admin", label: "Admin" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-slate-800 text-lg">
          Educação no Trânsito
        </Link>
        <nav className="flex items-center gap-4">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium ${
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "text-primary"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
