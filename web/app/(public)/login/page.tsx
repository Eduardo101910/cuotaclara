"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BtnArrow from "@/components/BtnArrow";
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

type PasoRecuperacion = "email" | "codigo" | "password";

function LoginForm() {
  const searchParams = useSearchParams();
  const siguienteRuta = searchParams.get("next") ?? "/dashboard";

  const [modo, setModo] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // --- Recuperación de contraseña, dentro de la misma tarjeta ---
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<PasoRecuperacion>("email");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCodigo, setRecoveryCodigo] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirmar, setRecoveryConfirmar] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: nombre,
            last_name: apellido,
          },
        },
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
        setNombre("");
        setApellido("");
      }
    }
  }

  // --- Abrir el panel de recuperación (reemplaza el link a /recuperar) ---
  function openRecovery() {
    setRecoveryOpen(true);
    setRecoveryStep("email");
    setRecoveryEmail(email);
    setRecoveryCodigo("");
    setRecoveryPassword("");
    setRecoveryConfirmar("");
    setRecoveryError(null);
    setRecoveryMessage(null);
  }

  function closeRecovery() {
    setRecoveryOpen(false);
  }

  // Paso 1: pedir el código por correo
  async function requestRecoveryCode(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail);

    setRecoveryLoading(false);
    if (error) {
      setRecoveryError(error.message);
      return;
    }
    setRecoveryStep("codigo");
    setRecoveryMessage("Si el correo está registrado, te enviamos un código de 6 dígitos.");
  }

  // Paso 2: verificar el código recibido
  async function verifyRecoveryCode(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryMessage(null);
    setRecoveryLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: recoveryEmail,
      token: recoveryCodigo,
      type: "recovery",
    });

    setRecoveryLoading(false);
    if (error) {
      setRecoveryError("Código inválido o vencido.");
      return;
    }
    setRecoveryStep("password");
    setRecoveryMessage("Código validado. Ahora registra tu nueva contraseña.");
  }

  // Paso 3: guardar la nueva contraseña (ya hay sesión temporal de recuperación)
  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryMessage(null);

    if (recoveryPassword.length < 6) {
      setRecoveryError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (recoveryPassword !== recoveryConfirmar) {
      setRecoveryError("Las contraseñas no coinciden.");
      return;
    }

    setRecoveryLoading(true);
    const { error } = await supabase.auth.updateUser({ password: recoveryPassword });
    setRecoveryLoading(false);

    if (error) {
      setRecoveryError(error.message);
      return;
    }

    setEmail(recoveryEmail);
    setPassword("");
    setRecoveryOpen(false);
    setRecoveryStep("email");
    setMensaje("Contraseña restablecida. Ya puedes iniciar sesión.");
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 sm:py-16 font-sans overflow-hidden">
      {/* Foto de fondo, a pantalla completa */}
      <Image
        src="https://images.unsplash.com/photo-1758876017801-f5a892ee460a?fm=jpg&q=80&w=1920&auto=format&fit=crop"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center -z-20"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/80 via-navy/70 to-navy/90" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <Link href="/" className="absolute top-6 left-1/2 -translate-x-1/2 sm:top-8">
        <Image src="/brand/logo-full.png" alt="CuotaClara" width={140} height={40} className="brightness-0 invert" priority />
      </Link>

      {/* --- TARJETA: login/registro, o recuperación (misma tarjeta, mismo lugar) --- */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10 relative z-10 mt-20 sm:mt-16">
        {recoveryOpen ? (
          <>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-extrabold text-navy uppercase tracking-tight mb-2">Recuperar contraseña</h1>
                <p className="text-slate-500 text-sm font-medium">
                  {recoveryStep === "email" && "Ingresa tu correo para recibir un código."}
                  {recoveryStep === "codigo" && "Ingresa el código de 6 dígitos que te enviamos."}
                  {recoveryStep === "password" && "Registra tu nueva contraseña."}
                </p>
              </div>
              <button onClick={closeRecovery} aria-label="Cerrar" className="text-slate-400 hover:text-slate-600 -mt-1 -mr-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" /></svg>
              </button>
            </div>

            {recoveryMessage && (
              <div className="p-3 mb-5 bg-teal/10 border border-teal/20 rounded-xl text-sm text-teal font-medium">{recoveryMessage}</div>
            )}
            {recoveryError && (
              <div className="p-3 mb-5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">{recoveryError}</div>
            )}

            {recoveryStep === "email" && (
              <form onSubmit={requestRecoveryCode} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                    placeholder="tu@empresa.com"
                  />
                </div>
                <button type="submit" disabled={recoveryLoading} className="btn-primary w-full">
                  {recoveryLoading ? "Enviando..." : "Enviar código"}
                </button>
              </form>
            )}

            {recoveryStep === "codigo" && (
              <form onSubmit={verifyRecoveryCode} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Código de 6 dígitos</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    value={recoveryCodigo}
                    onChange={(e) => setRecoveryCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full px-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-bold text-center text-2xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                    placeholder="000000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={requestRecoveryCode as any} disabled={recoveryLoading} className="btn-secondary">
                    Reenviar
                  </button>
                  <button type="submit" disabled={recoveryLoading || recoveryCodigo.length !== 6} className="btn-primary">
                    {recoveryLoading ? "Verificando..." : "Verificar"}
                  </button>
                </div>
              </form>
            )}

            {recoveryStep === "password" && (
              <form onSubmit={resetPassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Nueva contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={recoveryPassword}
                    onChange={(e) => setRecoveryPassword(e.target.value)}
                    className="w-full px-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Confirmar contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={recoveryConfirmar}
                    onChange={(e) => setRecoveryConfirmar(e.target.value)}
                    className="w-full px-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={recoveryLoading} className="btn-primary w-full">
                  {recoveryLoading ? "Guardando..." : "Restablecer contraseña"}
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-8">
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
              {modo === "registro" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Nombres</label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Apellidos</label>
                    <input
                      type="text"
                      required
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="w-full px-4 py-3.5 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      placeholder="Pérez"
                    />
                  </div>
                </div>
              )}

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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Contraseña</label>
                  {modo === "login" && (
                    <button type="button" onClick={openRecovery} className="text-xs text-teal hover:underline font-bold">
                      ¿Olvidó su contraseña?
                    </button>
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

              <button type="submit" disabled={cargando} className="btn-primary w-full mt-2">
                {cargando ? "Procesando..." : modo === "login" ? "Ingresar al Sistema" : "Registrarme"}
                {!cargando && <BtnArrow />}
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
          </>
        )}
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/70 font-medium text-center px-4">
        © 2024 CuotaClara. Todos los derechos reservados.
      </p>
    </main>
  );
}