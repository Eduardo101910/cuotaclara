"use client";

import { useState } from "react";
import { SimulacionInput } from "@/lib/motor";

interface Props {
  onSimular: (input: SimulacionInput) => void;
}

export default function FormularioSimulacion({ onSimular }: Props) {
  const [monto, setMonto] = useState("10000");
  const [plazoMeses, setPlazoMeses] = useState("12");
  const [tea, setTea] = useState("45");
  const [comisionMensual, setComisionMensual] = useState("5");
  const [seguroDesgravamenPorc, setSeguroDesgravamenPorc] = useState("0.05");
  const [portesMensual, setPortesMensual] = useState("0");

  const [tieneComisionDesembolso, setTieneComisionDesembolso] = useState(false);
  const [comisionDesembolso, setComisionDesembolso] = useState("100");

  const [quiereCapacidadPago, setQuiereCapacidadPago] = useState(false);
  const [ingresoMensual, setIngresoMensual] = useState("1500");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const input: SimulacionInput = {
      monto: Number(monto),
      plazoMeses: Number(plazoMeses),
      tea: Number(tea) / 100,
      comisionMensual: Number(comisionMensual),
      seguroDesgravamenPorc: Number(seguroDesgravamenPorc) / 100,
      portesMensual: Number(portesMensual),
      fechaInicio: new Date(),
    };

    if (tieneComisionDesembolso) input.comisionDesembolso = Number(comisionDesembolso);
    if (quiereCapacidadPago) input.ingresoMensual = Number(ingresoMensual);

    onSimular(input);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl mx-auto lg:mx-0 overflow-hidden text-left">
      {/* Cabecera del Formulario */}
      <div className="bg-slate-50 border-b border-slate-200 p-6 md:p-8">
        <h2 className="text-xl font-extrabold text-navy uppercase tracking-wide flex items-center gap-3">
          <span className="w-8 h-8 rounded bg-navy text-white flex items-center justify-center text-sm font-bold shrink-0">1</span>
          Datos del Préstamo
        </h2>
        <p className="text-sm text-slate-600 font-medium mt-2">Complete los campos para calcular su cuota real.</p>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Sección: Datos Principales */}
        <div className="space-y-6">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Datos Principales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Campo label="MONTO SOLICITADO (S/)">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">S/</span>
                <input type="number" min="1" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white text-left" />
              </div>
            </Campo>

            <Campo label="PLAZO (MESES)">
              <input type="number" min="1" max="60" required value={plazoMeses} onChange={(e) => setPlazoMeses(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white text-left" />
            </Campo>

            <Campo label="TEA — TASA EFECTIVA ANUAL (%)">
              <div className="relative">
                <input type="number" min="0" step="0.01" required value={tea} onChange={(e) => setTea(e.target.value)} className="w-full pr-10 pl-4 py-3 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white text-left" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
              </div>
            </Campo>
          </div>
        </div>

        {/* Sección: Cargos Mensuales */}
        <div className="space-y-6">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Cargos Mensuales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Campo label="COMISIÓN DE ADMINISTRACIÓN (S/)">
              <input type="number" min="0" step="0.01" value={comisionMensual} onChange={(e) => setComisionMensual(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white text-left" />
            </Campo>

            <Campo label="SEGURO DE DESGRAVAMEN (% SOBRE SALDO)">
              <div className="relative">
                <input type="number" min="0" step="0.001" value={seguroDesgravamenPorc} onChange={(e) => setSeguroDesgravamenPorc(e.target.value)} className="w-full pr-10 pl-4 py-3 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white text-left" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
              </div>
            </Campo>

            <Campo label="PORTES U OTROS CARGOS FIJOS (S/)">
              <input type="number" min="0" step="0.01" value={portesMensual} onChange={(e) => setPortesMensual(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white text-left" />
            </Campo>
          </div>
        </div>

        {/* Sección: Opcionales */}
        <div className="space-y-6">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Opcionales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50">
                <input type="checkbox" checked={tieneComisionDesembolso} onChange={(e) => setTieneComisionDesembolso(e.target.checked)} className="mt-1 w-4 h-4 text-teal rounded focus:ring-teal shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-bold text-navy uppercase tracking-wide block">Comisión de desembolso</span>
                  <span className="text-xs text-slate-500 font-medium">Cargo único al inicio</span>
                </div>
              </label>
              {tieneComisionDesembolso && (
                <Campo label="MONTO DE COMISIÓN (S/)">
                  <input type="number" min="0" step="0.01" value={comisionDesembolso} onChange={(e) => setComisionDesembolso(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white text-left" />
                </Campo>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50">
                <input type="checkbox" checked={quiereCapacidadPago} onChange={(e) => setQuiereCapacidadPago(e.target.checked)} className="mt-1 w-4 h-4 text-teal rounded focus:ring-teal shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-bold text-navy uppercase tracking-wide block">Capacidad de pago</span>
                  <span className="text-xs text-slate-500 font-medium">Ajuste a su ingreso</span>
                </div>
              </label>
              {quiereCapacidadPago && (
                <Campo label="INGRESO MENSUAL (S/)">
                  <input type="number" min="1" step="0.01" value={ingresoMensual} onChange={(e) => setIngresoMensual(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all bg-slate-50 focus:bg-white text-left" />
                </Campo>
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-navy text-white font-extrabold uppercase tracking-wider py-4 rounded-xl hover:bg-navy/90 active:scale-[0.98] transition-all shadow-md text-sm mt-4">
          Calcular Préstamo
        </button>
      </div>
    </form>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-left">
      <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide">{label}</label>
      {children}
    </div>
  );
}