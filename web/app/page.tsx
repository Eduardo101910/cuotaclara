import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold text-navy mb-2">CuotaClara</h1>
      <p className="text-teal text-xl font-medium mb-8">
        Simula tu préstamo. Que no te engañen.
      </p>

      <p className="max-w-md text-slate-600 mb-10">
        Antes de aceptar un préstamo personal, descubre cuánto vas a pagar de
        verdad: cuota, intereses, comisiones y la TCEA real — no solo la tasa
        que te muestran en el anuncio.
      </p>

      <Link
        href="/simular"
        className="bg-navy text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:opacity-90 transition"
      >
        Simular ahora — es gratis
      </Link>

      <p className="text-sm text-slate-400 mt-6">
        No necesitas registrarte para simular.
      </p>

      <ul className="mt-14 grid gap-3 text-left max-w-md text-slate-600 text-sm">
        <li>✓ Calculamos tu TCEA real, no solo la tasa que publicitan</li>
        <li>✓ Ves el cronograma de pago completo, mes a mes</li>
        <li>✓ Si decides continuar, te avisamos antes de cada fecha de pago</li>
      </ul>
    </main>
  );
}
