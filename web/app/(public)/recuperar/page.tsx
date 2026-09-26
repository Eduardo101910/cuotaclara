"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const redirectTo = `${window.location.origin}/restablecer`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setCargando(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEnviado(true);
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
          <h2 className="font-display font-extrabold text-4xl leading-tight mb-6">
            Recupere el acceso a su cuenta de forma segura.
          </h2>
          <ul className="space-y-5 text-slate-300 font-medium">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs">✓</span>
              Enlace de un solo uso, válido por tiempo limitado
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs">✓</span>
              Enviado únicamente al correo registrado
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

          {enviado ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h1 className="text-2xl font-extrabold text-navy uppercase tracking-tight mb-2">Revisa tu correo</h1>
              <p className="text-slate-500 text-sm font-medium mb-8">
                Si <strong className="text-navy">{email}</strong> está registrado, te enviamos un enlace para restablecer tu contraseña.
              </p>
              <Link href="/login" className="text-sm text-teal hover:underline font-bold">
                ← Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-2xl font-extrabold text-navy uppercase tracking-tight mb-2">Recuperar contraseña</h1>
                <p className="text-slate-500 text-sm font-medium">
                  Ingresa tu correo y te enviaremos un enlace para restablecerla.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Correo Electrónico</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      placeholder="tu@empresa.com"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={cargando} className="w-full bg-navy text-white font-extrabold uppercase tracking-wider py-4 rounded-xl hover:bg-navy/90 active:scale-[0.98] transition-all shadow-md text-sm mt-2 disabled:opacity-50">
                  {cargando ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <Link href="/login" className="text-sm text-slate-500 hover:text-navy font-bold transition-colors">
                  ← Volver a iniciar sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}