import { simular, compararPlazos, calcularPagoAnticipado, teaATem } from "./index";

// ===== CASO BASE: sin ninguna casilla opcional marcada =====
// (comisionDesembolso e ingresoMensual se omiten -> el motor los ignora)
const resultado = simular({
  monto: 10000,
  plazoMeses: 12,
  tea: 0.45,
  comisionMensual: 5,
  seguroDesgravamenPorc: 0.0005,
  portesMensual: 0,
  fechaInicio: new Date("2026-10-01"),
});

console.log("TEM:", (resultado.tem * 100).toFixed(4) + "%");
console.log("TCEA:", (resultado.tcea * 100).toFixed(2) + "%");
console.log("Cuota base (1ra cuota):", resultado.cuotaBaseFrances);
console.log("Total intereses:", resultado.totalIntereses);
console.log("Total comisiones:", resultado.totalComisiones);
console.log("Total seguros:", resultado.totalSeguros);
console.log("Total pagado:", resultado.totalPagado);
console.log("");
console.table(
  resultado.cronograma.map((c) => ({
    "N°": c.numeroCuota,
    Fecha: c.fechaPago?.toISOString().slice(0, 10),
    "Saldo inicial": c.saldoInicial,
    Interes: c.interes,
    Amortizacion: c.amortizacion,
    Seguro: c.seguroDesgravamen,
    Comision: c.comision,
    "Cuota total": c.cuotaTotal,
    "Saldo final": c.saldoFinal,
  }))
);

// ===== CASO CON CASILLAS OPCIONALES MARCADAS =====
console.log("\n=== Con comisión de desembolso + capacidad de pago activadas ===");
const resultadoConOpcionales = simular({
  monto: 10000,
  plazoMeses: 12,
  tea: 0.45,
  comisionMensual: 5,
  seguroDesgravamenPorc: 0.0005,
  portesMensual: 0,
  fechaInicio: new Date("2026-10-01"),
  comisionDesembolso: 150, // usuario marcó "tiene comisión de desembolso"
  ingresoMensual: 1500, // usuario marcó "calcular mi capacidad de pago"
});
console.log("TCEA con comisión de desembolso:", (resultadoConOpcionales.tcea * 100).toFixed(2) + "%");
console.log("Capacidad de pago:", resultadoConOpcionales.capacidadPago);

// ===== COMPARADOR DE PLAZOS (opcional) =====
console.log("\n=== Comparador de plazos (12 / 24 / 36 meses) ===");
const comparacion = compararPlazos(
  {
    monto: 10000,
    tea: 0.45,
    comisionMensual: 5,
    seguroDesgravamenPorc: 0.0005,
    portesMensual: 0,
  },
  [12, 24, 36]
);
console.table(comparacion);

// ===== PAGO ANTICIPADO (opcional) =====
console.log("\n=== Pago anticipado: abono de S/ 2,000 en la cuota 6, modalidad reducir cuota ===");
const tem = teaATem(0.45);
const pagoAnticipado = calcularPagoAnticipado(resultado.cronograma, 6, 2000, tem, "reducir_cuota");
console.log(pagoAnticipado);

console.log("\n=== Pago anticipado: abono de S/ 2,000 en la cuota 6, modalidad reducir plazo ===");
const pagoAnticipado2 = calcularPagoAnticipado(resultado.cronograma, 6, 2000, tem, "reducir_plazo");
console.log(pagoAnticipado2);
