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

  // --- Casillas opcionales ---
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

    // Los campos opcionales solo se incluyen si el usuario marcó la casilla.
    if (tieneComisionDesembolso) {
      input.comisionDesembolso = Number(comisionDesembolso);
    }
    if (quiereCapacidadPago) {
      input.ingresoMensual = Number(ingresoMensual);
    }

    onSimular(input);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5 max-w-lg w-full">
      <h2 className="text-2xl font-bold text-navy">Datos de tu préstamo</h2>

      <Campo label="Monto solicitado (S/)">
        <input type="number" min="1" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} className="input" />
      </Campo>

      <Campo label="Plazo (meses)">
        <input type="number" min="1" max="60" required value={plazoMeses} onChange={(e) => setPlazoMeses(e.target.value)} className="input" />
      </Campo>

      <Campo label="TEA — Tasa Efectiva Anual (%)">
        <input type="number" min="0" step="0.01" required value={tea} onChange={(e) => setTea(e.target.value)} className="input" />
      </Campo>

      <Campo label="Comisión de administración mensual (S/)">
        <input type="number" min="0" step="0.01" value={comisionMensual} onChange={(e) => setComisionMensual(e.target.value)} className="input" />
      </Campo>

      <Campo label="Seguro de desgravamen mensual (% sobre saldo)">
        <input type="number" min="0" step="0.001" value={seguroDesgravamenPorc} onChange={(e) => setSeguroDesgravamenPorc(e.target.value)} className="input" />
      </Campo>

      <Campo label="Portes u otros cargos fijos mensuales (S/)">
        <input type="number" min="0" step="0.01" value={portesMensual} onChange={(e) => setPortesMensual(e.target.value)} className="input" />
      </Campo>

      <hr className="border-slate-200" />

      {/* --- Casilla opcional: comisión de desembolso --- */}
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={tieneComisionDesembolso} onChange={(e) => setTieneComisionDesembolso(e.target.checked)} />
        ¿Tu préstamo tiene comisión de desembolso (cargo único al inicio)?
      </label>
      {tieneComisionDesembolso && (
        <Campo label="Comisión de desembolso (S/)">
          <input type="number" min="0" step="0.01" value={comisionDesembolso} onChange={(e) => setComisionDesembolso(e.target.value)} className="input" />
        </Campo>
      )}

      {/* --- Casilla opcional: capacidad de pago --- */}
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={quiereCapacidadPago} onChange={(e) => setQuiereCapacidadPago(e.target.checked)} />
        ¿Quieres saber si la cuota se ajusta a tu capacidad de pago?
      </label>
      {quiereCapacidadPago && (
        <Campo label="Tu ingreso mensual (S/)">
          <input type="number" min="1" step="0.01" value={ingresoMensual} onChange={(e) => setIngresoMensual(e.target.value)} className="input" />
        </Campo>
      )}

      <button type="submit" className="w-full bg-teal text-white font-semibold py-3 rounded-lg hover:opacity-90 transition">
        Calcular
      </button>
    </form>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
