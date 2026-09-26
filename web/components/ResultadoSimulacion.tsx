import { ResultadoSimulacion } from "@/lib/motor";

interface Props {
  resultado: ResultadoSimulacion;
}

const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const formatoFecha = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export default function ResultadoSimulacionView({ resultado }: Props) {
  return (
    <div className="space-y-6">
      {/* --- Tarjetas de Métricas (KPIs) --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metrica etiqueta="Cuota Mensual" valor={formatoSoles.format(resultado.cuotaBaseFrances)} destacado />
        <Metrica etiqueta="TCEA (Costo Real)" valor={`${(resultado.tcea * 100).toFixed(2)}%`} alerta />
        <Metrica etiqueta="Total Intereses" valor={formatoSoles.format(resultado.totalIntereses)} />
        <Metrica etiqueta="Total a Pagar" valor={formatoSoles.format(resultado.totalPagado)} />
      </div>

      {resultado.capacidadPago && (
        <div
          className={`rounded-xl p-5 text-sm font-medium border ${
            resultado.capacidadPago.alerta 
              ? "bg-red-50 text-red-700 border-red-200" 
              : "bg-teal/5 text-teal-800 border-teal/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {resultado.capacidadPago.alerta ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <span className="font-bold">Análisis de Capacidad de Pago</span>
          </div>
          Tu cuota representa el <strong>{(resultado.capacidadPago.porcentajeSobreIngreso * 100).toFixed(1)}%</strong> de tu ingreso mensual.{" "}
          {resultado.capacidadPago.alerta
            ? "Esto supera el 30% recomendado — evalúa un plazo más largo o un monto menor."
            : "Está dentro del rango recomendado (hasta 30% del ingreso)."}
        </div>
      )}

      {/* --- Tabla de Cronograma de Alto Contraste --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-navy text-lg">Cronograma de Pagos</h3>
          <p className="text-sm text-slate-500">Detalle de amortización e intereses mes a mes.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy text-white text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-4">N°</th>
                <th className="px-4 py-4">Fecha</th>
                <th className="px-4 py-4 text-right">Interés</th>
                <th className="px-4 py-4 text-right">Amortización</th>
                <th className="px-4 py-4 text-right bg-navy/90">Cuota Total</th>
                <th className="px-4 py-4 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resultado.cronograma.map((c) => (
                <tr key={c.numeroCuota} className="hover:bg-sky-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-700">{c.numeroCuota}</td>
                  <td className="px-4 py-3 text-slate-600">{c.fechaPago ? formatoFecha.format(c.fechaPago) : "—"}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatoSoles.format(c.interes)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatoSoles.format(c.amortizacion)}</td>
                  <td className="px-4 py-3 text-right font-bold text-navy bg-sky-50/50">{formatoSoles.format(c.cuotaTotal)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-500">{formatoSoles.format(c.saldoFinal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          Esta simulación es referencial. Compare con la TCEA real de cada banco en la <a href="https://www.sbs.gob.pe" target="_blank" rel="noreferrer" className="text-teal font-bold hover:underline">SBS</a>.
        </div>
      </div>
    </div>
  );
}

function Metrica({ etiqueta, valor, destacado, alerta }: { etiqueta: string; valor: string; destacado?: boolean; alerta?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${destacado ? "bg-navy text-white border-navy" : "bg-white border-slate-200 shadow-sm"}`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${destacado ? "text-slate-300" : "text-slate-500"}`}>{etiqueta}</p>
      <p className={`text-lg md:text-xl font-extrabold ${alerta ? "text-teal" : destacado ? "text-white" : "text-navy"}`}>{valor}</p>
    </div>
  );
}