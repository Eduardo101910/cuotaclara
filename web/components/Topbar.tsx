"use client";

import { usePathname } from "next/navigation";

export function Topbar() {
  const pathname = usePathname();

  let titulo = "Panel de Control";
  if (pathname.includes("/simular")) titulo = "Simulador";

  return (
    <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200/70 flex items-center justify-between px-6 lg:px-8 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <h1 className="font-display font-bold text-navy text-xl truncate">{titulo}</h1>

        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 ml-8 border border-transparent focus-within:border-teal/30 focus-within:bg-white transition-colors">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Buscar préstamos, pagos..." className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-700 placeholder:text-slate-400" />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative text-slate-400 hover:text-navy transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-navy leading-tight">Usuario</p>
            <p className="text-xs text-slate-500">Administrador</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm shadow-md shadow-navy/20">
            US
          </div>
        </div>
      </div>
    </header>
  );
}