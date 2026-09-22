import { ResultadoSimulacion } from "@/lib/motor";

interface Props {
  resultado: ResultadoSimulacion;
}

const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const formatoFecha = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export default function ResultadoSimulacionView({ resultado }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-3xl space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Metrica etiqueta="Cuota mensual" valor={formatoSoles.format(resultado.cuotaBaseFrances)} destacado />
        <Metrica etiqueta="TCEA (costo real)" valor={`${(resultado.tcea * 100).toFixed(2)}%`} destacado alerta />
        <Metrica etiqueta="Total intereses" valor={formatoSoles.format(resultado.totalIntereses)} />
        <Metrica etiqueta="Total a pagar" valor={formatoSoles.format(resultado.totalPagado)} />
      </div>

      {resultado.capacidadPago && (
        <div
          className={`rounded-lg p-4 text-sm ${
            resultado.capacidadPago.alerta ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          Tu cuota representa el <strong>{(resultado.capacidadPago.porcentajeSobreIngreso * 100).toFixed(1)}%</strong> de tu ingreso mensual.{" "}
          {resultado.capacidadPago.alerta
            ? "Esto supera el 30% recomendado — evalúa un plazo más largo o un monto menor."
            : "Está dentro del rango recomendado (hasta 30% del ingreso)."}
        </div>
      )}

      <div>
        <h3 className="font-bold text-navy mb-3">Cronograma de pagos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-white">
                <th className="p-2 text-left">N°</th>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-right">Interés</th>
                <th className="p-2 text-right">Amortización</th>
                <th className="p-2 text-right">Cuota total</th>
                <th className="p-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {resultado.cronograma.map((c) => (
                <tr key={c.numeroCuota} className="border-b border-slate-100">
                  <td className="p-2">{c.numeroCuota}</td>
                  <td className="p-2">{c.fechaPago ? formatoFecha.format(c.fechaPago) : "—"}</td>
                  <td className="p-2 text-right">{formatoSoles.format(c.interes)}</td>
                  <td className="p-2 text-right">{formatoSoles.format(c.amortizacion)}</td>
                  <td className="p-2 text-right font-medium">{formatoSoles.format(c.cuotaTotal)}</td>
                  <td className="p-2 text-right">{formatoSoles.format(c.saldoFinal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Esta simulación es referencial. Compara con la TCEA real de cada banco en{" "}
        <a href="https://www.sbs.gob.pe" target="_blank" rel="noreferrer" className="underline">
          la SBS
        </a>
        .
      </p>
    </div>
  );
}

function Metrica({ etiqueta, valor, destacado, alerta }: { etiqueta: string; valor: string; destacado?: boolean; alerta?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${destacado ? "bg-slate-50" : ""}`}>
      <p className="text-xs text-slate-500">{etiqueta}</p>
      <p className={`text-lg font-bold ${alerta ? "text-teal" : "text-navy"}`}>{valor}</p>
    </div>
  );
}
