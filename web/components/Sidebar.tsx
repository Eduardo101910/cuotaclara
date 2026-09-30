"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const menuItems = [
  {
    name: "Resumen General",
    href: "/dashboard",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    name: "Cronograma de Pagos",
    href: "/dashboard/cronograma",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  // Puedes descomentar estas rutas cuando las crees
  // { name: "Historial de Pagos", href: "/dashboard/pagos", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

export function Sidebar() {
  const pathname = usePathname();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

   function isActive(href: string) {
    // "Resumen General" solo se activa en /dashboard y en el detalle de un préstamo,
    // no en las demás subrutas (como /dashboard/cronograma).
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/prestamo");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* ══════ Sidebar de escritorio ══════ */}
      <aside className="w-72 bg-white border-r border-slate-200/70 flex-col hidden md:flex shrink-0 h-full shadow-[2px_0_12px_rgba(15,23,42,0.03)]">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <span className="font-display font-extrabold text-2xl tracking-tight text-navy">
            Cuota<span className="text-teal">Clara</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                    ? "bg-teal text-white shadow-sm shadow-teal/25"
                    : "text-slate-500 hover:bg-slate-50 hover:text-navy"
                  }`}
              >
                <span className={active ? "text-white" : "text-slate-400"}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Cerrar Sesión */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ══════ Navegación inferior en móvil (tipo app) ══════ */}
      <nav className="md:hidden fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-2xl shadow-slate-900/15 backdrop-blur">
        <div className="flex gap-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold transition-all ${active ? "bg-teal text-white" : "text-slate-500"
                  }`}
              >
                {item.icon}
                <span className="truncate max-w-[70px]">{item.name.split(" ")[0]}</span>
              </Link>
            );
          })}
          <button
            onClick={cerrarSesion}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold text-red-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Salir
          </button>
        </div>
      </nav>
    </>
  );
}