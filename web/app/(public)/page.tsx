import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2 L4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
    ),
    label: "Rápido y 100% online",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3 4 6v6c0 5 3.4 8.7 8 9 4.6-.3 8-4 8-9V6l-8-3Z" /></svg>
    ),
    label: "Seguro y confiable",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20V10M12 20V4M20 20v-7" /></svg>
    ),
    label: "Sin sorpresas, siempre claro",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy text-white flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 px-8 py-6 mb-7">
          <Image src="/brand/logo-full.png" alt="CuotaClara" width={220} height={65} priority />
        </div>

        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-teal bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-teal" />
          100% online y gratis
        </span>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mb-5">
          Simula tu préstamo
          <br />
          <span className="text-teal">en minutos</span>
        </h1>

        <p className="text-slate-300 mb-10 leading-relaxed">
          Conoce tu cuota real, la TCEA y el cronograma de pagos de forma rápida, segura y sin complicaciones.
        </p>

        <div className="flex gap-4 mb-11 w-full justify-center">
          {features.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-2 flex-1 max-w-[130px] bg-white/5 border border-white/10 rounded-xl px-3 py-4 backdrop-blur-sm">
              <span className="w-9 h-9 rounded-full bg-white/10 text-teal flex items-center justify-center">{f.icon}</span>
              <span className="text-xs text-slate-300 leading-snug">{f.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/simular"
            className="inline-flex items-center justify-center gap-2 bg-white text-navy font-bold px-9 py-4 rounded-full shadow-xl shadow-black/30 hover:bg-slate-100 active:scale-[0.98] transition-all text-base"
          >
            Simular ahora
            <span>→</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-9 py-4 rounded-full border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all text-base backdrop-blur-sm"
          >
            Ya tengo cuenta
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-6">No necesitas registrarte para simular.</p>
      </div>
    </main>
  );
}