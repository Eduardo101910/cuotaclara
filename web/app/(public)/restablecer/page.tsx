"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function RestablecerPage() {
  return (
    <Suspense fallback={null}>
      <RestablecerForm />
    </Suspense>
  );
}

function RestablecerForm() {
  const [sesionLista, setSesionLista] = useState(false);
  const [enlaceInvalido, setEnlaceInvalido] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setSesionLista(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSesionLista(true);
    });

    const timeout = setTimeout(() => {
      if (!sesionLista) setEnlaceInvalido(true);
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password });
    setCargando(false);

    if (error) {
      setError(error.message);
      return;
    }
    setListo(true);
  }

  return (
    <main className="min-h-screen flex bg-slate-50 font-sans">
      <div className="hidden lg:flex lg:w-1/2 bg-navy text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/20 rounded-full blur-[100px] -z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-0" />

        <div className="relative z-10">
          <Image src="/brand/logo-full.png" alt="CuotaClara" width={160} height={50} className="brightness-0 invert" />
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display font-extrabold text-4xl leading-tight mb-6">Elige una contraseña nueva y segura.</h2>
          <ul className="space-y-5 text-slate-300 font-medium">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs">✓</span>
              Mínimo 6 caracteres
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs">✓</span>
              Evita reutilizar contraseñas de otros sitios
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-400 relative z-10 font-medium">© 2024 CuotaClara. Todos los derechos reservados.</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 to-white relative">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-10 relative z-10">
          <div className="lg:hidden mb-8 text-center">
            <Image src="/brand/logo-full.png" alt="CuotaClara" width={140} height={40} className="mx-auto" />
          </div>

          {enlaceInvalido && !sesionLista ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h1 className="text-2xl font-extrabold text-navy uppercase tracking-tight mb-2">Enlace inválido o vencido</h1>
              <p className="text-slate-500 text-sm font-medium mb-8">
                Este enlace de recuperación ya no es válido. Solicita uno nuevo para continuar.
              </p>
              <Link href="/recuperar" className="btn-primary">Solicitar nuevo enlace</Link>
            </div>
          ) : listo ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h1 className="text-2xl font-extrabold text-navy uppercase tracking-tight mb-2">Contraseña actualizada</h1>
              <p className="text-slate-500 text-sm font-medium mb-8">Ya puedes iniciar sesión con tu nueva contraseña.</p>
              <Link href="/login" className="btn-primary">Ir a iniciar sesión</Link>
            </div>
          ) : (
            <>
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-2xl font-extrabold text-navy uppercase tracking-tight mb-2">Nueva contraseña</h1>
                <p className="text-slate-500 text-sm font-medium">Define la nueva contraseña para tu cuenta.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Nueva contraseña</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Confirmar contraseña</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={cargando || !sesionLista}
                  className="w-full bg-navy text-white font-extrabold uppercase tracking-wider py-4 rounded-xl hover:bg-navy/90 active:scale-[0.98] transition-all shadow-md text-sm mt-2 disabled:opacity-50"
                >
                  {cargando ? "Guardando..." : "Guardar nueva contraseña"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}