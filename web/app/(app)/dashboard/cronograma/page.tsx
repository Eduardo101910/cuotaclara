"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface CuotaConPrestamo {
  id: string;
  loan_active_id: string;
  numero_cuota: number;
  fecha_pago: string;
  monto_cuota: number;
  pagado: boolean;
  monto_prestamo: number;
}

type Filtro = "pendientes" | "pagadas" | "todas";

const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const formatoFecha = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export default function CronogramaPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cuotas, setCuotas] = useState<CuotaConPrestamo[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("pendientes");

  useEffect(() => {
    cargarCronograma();
  }, []);

  async function cargarCronograma() {
    setCargando(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "/login?next=/dashboard/cronograma";
      return;
    }

    const { data, error: errorConsulta } = await supabase
      .from("loan_active")
      .select("id, loan_simulations(monto), payments(id, numero_cuota, fecha_pago, monto_cuota, pagado)");

    if (errorConsulta) {
      setError(errorConsulta.message);
      setCargando(false);
      return;
    }

    const todasLasCuotas: CuotaConPrestamo[] = (data ?? []).flatMap((prestamo: any) =>
      (prestamo.payments ?? []).map((pago: any) => ({
        id: pago.id,
        loan_active_id: prestamo.id,
        numero_cuota: pago.numero_cuota,
        fecha_pago: pago.fecha_pago,
        monto_cuota: pago.monto_cuota,
        pagado: pago.pagado,
        monto_prestamo: prestamo.loan_simulations?.monto ?? 0,
      }))
    );

    todasLasCuotas.sort((a, b) => new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime());

    setCuotas(todasLasCuotas);
    setCargando(false);
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Cargando tu cronograma...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">{error}</div>;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const cuotasFiltradas = cuotas.filter((c) => {
    if (filtro === "pendientes") return !c.pagado;
    if (filtro === "pagadas") return c.pagado;
    return true;
  });

  const totalPendiente = cuotas.filter((c) => !c.pagado).reduce((acc, c) => acc + c.monto_cuota, 0);
  const proxima = cuotas.find((c) => !c.pagado);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy">Cronograma de Pagos</h2>
        <p className="text-slate-500 text-sm mt-1">Todas tus cuotas, de todos tus préstamos, en un solo lugar.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total pendiente</p>
          <p className="text-2xl font-extrabold text-navy">{formatoSoles.format(totalPendiente)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Próxima cuota</p>
          {proxima ? (
            <p className="text-2xl font-extrabold text-navy">
              {formatoSoles.format(proxima.monto_cuota)}{" "}
              <span className="text-sm font-semibold text-slate-500">· {formatoFecha.format(new Date(proxima.fecha_pago))}</span>
            </p>
          ) : (
            <p className="text-teal font-bold">✓ No tienes cuotas pendientes</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {([
          { key: "pendientes", label: "Pendientes" },
          { key: "pagadas", label: "Pagadas" },
          { key: "todas", label: "Todas" },
        ] as { key: Filtro; label: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              filtro === f.key ? "bg-teal text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cuotasFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 font-medium">No hay cuotas en esta categoría.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cuotasFiltradas.map((c) => {
              const vencida = !c.pagado && new Date(c.fecha_pago) < hoy;
              return (
                <Link
                  key={c.id}
                  href={`/dashboard/prestamo/${c.loan_active_id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        c.pagado ? "bg-teal-50 text-teal-600" : vencida ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      #{c.numero_cuota}
                    </span>
                    <div>
                      <p className="font-bold text-navy text-sm">{formatoFecha.format(new Date(c.fecha_pago))}</p>
                      <p className="text-xs text-slate-400">Préstamo de {formatoSoles.format(c.monto_prestamo)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-navy">{formatoSoles.format(c.monto_cuota)}</p>
                    {c.pagado ? (
                      <span className="text-teal text-xs font-bold">✓ Pagada</span>
                    ) : vencida ? (
                      <span className="text-red-500 text-xs font-bold">Vencida</span>
                    ) : (
                      <span className="text-slate-400 text-xs font-semibold">Pendiente</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}