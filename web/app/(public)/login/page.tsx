"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { guardarSimulacionYActivar } from "@/lib/guardarPrestamo";
import { leerSimulacionPendiente, borrarSimulacionPendiente } from "@/lib/simulacionPendiente";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const siguienteRuta = searchParams.get("next") ?? "/dashboard";

  const [modo, setModo] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Nuevos estados para el registro
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function despuesDeAutenticar(userId: string) {
    const pendiente = leerSimulacionPendiente();
    if (pendiente) {
      try {
        await guardarSimulacionYActivar(pendiente.input, pendiente.resultado, userId);
        borrarSimulacionPendiente();
      } catch (e) {
        console.error("No se pudo guardar la simulación pendiente:", e);
      }
      window.location.href = "/dashboard";
      return;
    }
    window.location.href = siguienteRuta;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setCargando(true);

    if (modo === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setCargando(false);
      if (error) {
        setError(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
        return;
      }
      if (data.user) await despuesDeAutenticar(data.user.id);
    } else {
      // Actualizado: Enviamos Nombres y Apellidos en los metadatos (options.data)
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: nombre,
            last_name: apellido,
          }
        }
      });
      
      setCargando(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session && data.user) {
        await despuesDeAutenticar(data.user.id);
      } else {
        setMensaje("Te enviamos un correo de confirmación. Verifica tu bandeja y luego inicia sesión.");
        setModo("login");
        // Limpiamos los campos de registro
        setNombre("");
        setApellido("");
      }
    }
  }

  return (
    <main className="min-h-screen flex bg-slate-50 font-sans">
      {/* --- PANEL IZQUIERDO: BRANDING Y SEGURIDAD --- */}
            <div className="hidden lg:flex lg:w-1/2 bg-navy text-white flex-col justify-between p-12 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1758876017801-f5a892ee460a?fm=jpg&q=80&w=1200&auto=format&fit=crop"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-center -z-10"
        />
        <div className="absolute inset-0 -z-0 bg-gradient-to-br from-navy via-navy/90 to-navy/70" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/20 rounded-full blur-[100px] -z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-0" />

        <div className="relative z-10">
          <Image src="/brand/logo-full.png" alt="CuotaClara" width={160} height={50} className="brightness-0 invert" />
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display font-extrabold text-4xl leading-tight mb-6">
            Gestione sus finanzas con total seguridad.
          </h2>
          <ul className="space-y-5 text-slate-300 font-medium">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs">✓</span>
              Encriptación de extremo a extremo
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs">✓</span>
              Cumplimiento normativo financiero (SBS)
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs">✓</span>
              Seguimiento de cuotas en tiempo real
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-400 relative z-10 font-medium">© 2024 CuotaClara. Todos los derechos reservados.</p>
      </div>

      {/* --- PANEL DERECHO: FORMULARIO --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 to-white relative">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-10 relative z-10">
          
          <div className="lg:hidden mb-8 text-center">
            <Image src="/brand/logo-full.png" alt="CuotaClara" width={140} height={40} className="mx-auto" />
          </div>
          
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-2xl font-extrabold text-navy uppercase tracking-tight mb-2">
              {modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {modo === "login" 
                ? "Acceda a su panel de control financiero." 
                : "Comience a gestionar sus préstamos de forma segura."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* --- CAMPOS DE REGISTRO (Solo visibles en modo registro) --- */}
            {modo === "registro" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Nombres</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </span>
                    <input 
                      type="text" 
                      required 
                      value={nombre} 
                      onChange={(e) => setNombre(e.target.value)} 
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white" 
                      placeholder="Juan" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Apellidos</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </span>
                    <input 
                      type="text" 
                      required 
                      value={apellido} 
                      onChange={(e) => setApellido(e.target.value)} 
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white" 
                      placeholder="Pérez" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- CORREO ELECTRÓNICO --- */}
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

            {/* --- CONTRASEÑA --- */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Contraseña</label>
                {modo === "login" && (
                  <Link href="/recuperar" className="text-xs text-teal hover:underline font-bold">
                    ¿Olvidó su contraseña?
                  </Link>
                )}
              </div>
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

            {/* --- MENSAJES DE ERROR / ÉXITO --- */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}
            {mensaje && (
              <div className="p-4 bg-teal/10 border border-teal/20 rounded-xl text-sm text-teal font-medium flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {mensaje}
              </div>
            )}

            <button type="submit" disabled={cargando} className="w-full bg-navy text-white font-extrabold uppercase tracking-wider py-4 rounded-xl hover:bg-navy/90 active:scale-[0.98] transition-all shadow-md text-sm mt-2">
              {cargando ? "Procesando..." : modo === "login" ? "Ingresar al Sistema" : "Registrarme"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button
              onClick={() => { 
                setModo(modo === "login" ? "registro" : "login"); 
                setError(null); 
                setMensaje(null);
                setNombre("");
                setApellido("");
              }}
              className="text-sm text-slate-500 hover:text-navy font-bold transition-colors"
            >
              {modo === "login" ? "¿No tiene cuenta? Registrar" : "¿Ya tiene cuenta? Inicie sesión"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}