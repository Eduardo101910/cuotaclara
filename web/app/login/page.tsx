"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
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
      const { data, error } = await supabase.auth.signUp({ email, password });
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
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-navy mb-1">
          {modo === "login" ? "Inicia sesión" : "Crea tu cuenta gratis"}
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          {modo === "login"
            ? "Para ver el seguimiento de tus préstamos activos."
            : "Solo necesitamos tu correo para avisarte de tus pagos."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {mensaje && <p className="text-sm text-teal">{mensaje}</p>}

          <button type="submit" disabled={cargando} className="w-full bg-navy text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50">
            {cargando ? "Un momento..." : modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button
          onClick={() => {
            setModo(modo === "login" ? "registro" : "login");
            setError(null);
            setMensaje(null);
          }}
          className="text-sm text-teal mt-4 hover:underline"
        >
          {modo === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </main>
  );
}