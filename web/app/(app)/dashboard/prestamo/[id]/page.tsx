"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface Cuota {
  id: string;
  numero_cuota: number;
  fecha_pago: string;
  monto_cuota: number;
  interes: number;
  amortizacion: number;
  seguro: number;
  comision: number;
  saldo: number;
  pagado: boolean;
}

interface PrestamoDetalle {
  id: string;
  estado: string;
  fecha_inicio: string;
  loan_simulations: {
    monto: number;
    plazo_meses: number;
    tea: number;
    tcea_calculada: number;
    comision_mensual: number;
    seguro_desgravamen_porc: number;
  };
}

const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const formatoFecha = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export default function DetallePrestamoPage() {
  const params = useParams();
  const id = params.id as string;

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prestamo, setPrestamo] = useState<PrestamoDetalle | null>(null);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);

  useEffect(() => {
    cargarDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function cargarDetalle() {
    setCargando(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = `/login?next=/dashboard/prestamo/${id}`;
      return;
    }

    const { data: activo, error: errorActivo } = await supabase
      .from("loan_active")
      .select("id, estado, fecha_inicio, loan_simulations(monto, plazo_meses, tea, tcea_calculada, comision_mensual, seguro_desgravamen_porc)")
      .eq("id", id)
      .maybeSingle();

    if (errorActivo || !activo) {
      setError("No se encontró este préstamo, o no tienes acceso a él.");
      setCargando(false);
      return;
    }

    const { data: pagos, error: errorPagos } = await supabase
      .from("payments")
      .select("id, numero_cuota, fecha_pago, monto_cuota, interes, amortizacion, seguro, comision, saldo, pagado")
      .eq("loan_active_id", id)
      .order("numero_cuota", { ascending: true });

    if (errorPagos) {
      setError(errorPagos.message);
      setCargando(false);
      return;
    }

    setPrestamo(activo as unknown as PrestamoDetalle);
    setCuotas(pagos ?? []);
    setCargando(false);
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Cargando préstamo...</p>
      </div>
    );
  }

  if (error || !prestamo) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
        <p className="text-red-600 font-semibold mb-4">{error ?? "No se encontró el préstamo."}</p>
        <Link href="/dashboard" className="btn-primary">← Volver al panel</Link>
      </div>
    );
  }

  const proxima = cuotas.find((c) => !c.pagado);
  const cuotasPagadas = cuotas.filter((c) => c.pagado).length;
  const progreso = cuotas.length ? Math.round((cuotasPagadas / cuotas.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-navy font-semibold inline-flex items-center gap-1">
        ← Volver al panel
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monto del préstamo</p>
            <p className="text-3xl font-extrabold text-navy">{formatoSoles.format(prestamo.loan_simulations.monto)}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
            prestamo.estado === "activo" ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"
          }`}>
            {prestamo.estado.charAt(0).toUpperCase() + prestamo.estado.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Plazo</p>
            <p className="font-bold text-navy">{prestamo.loan_simulations.plazo_meses} meses</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">TEA</p>
            <p className="font-bold text-navy">{(prestamo.loan_simulations.tea * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">TCEA</p>
            <p className="font-bold text-navy">{(prestamo.loan_simulations.tcea_calculada * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Inicio</p>
            <p className="font-bold text-navy">{formatoFecha.format(new Date(prestamo.fecha_inicio))}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>{cuotasPagadas} de {cuotas.length} cuotas pagadas</span>
            <span>{progreso}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${progreso}%` }} />
          </div>
        </div>

        {proxima && (
          <div className="mt-6 bg-slate-50 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">
              Próxima cuota (#{proxima.numero_cuota}): {formatoFecha.format(new Date(proxima.fecha_pago))}
            </span>
            <span className="font-extrabold text-navy">{formatoSoles.format(proxima.monto_cuota)}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-navy text-lg">Cronograma de pagos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">N°</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Interés</th>
                <th className="px-6 py-4 text-right">Amortización</th>
                <th className="px-6 py-4 text-right">Cuota</th>
                <th className="px-6 py-4 text-right">Saldo</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cuotas.map((c) => (
                <tr key={c.id} className={c.pagado ? "bg-teal-50/30" : "hover:bg-slate-50 transition-colors"}>
                  <td className="px-6 py-3 font-semibold text-slate-600">{c.numero_cuota}</td>
                  <td className="px-6 py-3 text-slate-600">{formatoFecha.format(new Date(c.fecha_pago))}</td>
                  <td className="px-6 py-3 text-right text-slate-600">{formatoSoles.format(c.interes)}</td>
                  <td className="px-6 py-3 text-right text-slate-600">{formatoSoles.format(c.amortizacion)}</td>
                  <td className="px-6 py-3 text-right font-bold text-navy">{formatoSoles.format(c.monto_cuota)}</td>
                  <td className="px-6 py-3 text-right text-slate-600">{formatoSoles.format(c.saldo)}</td>
                  <td className="px-6 py-3 text-center">
                    {c.pagado ? (
                      <span className="text-teal font-bold text-xs">✓ Pagada</span>
                    ) : (
                      <span className="text-slate-400 font-semibold text-xs">Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}