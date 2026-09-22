import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CuotaClara — Simulador de préstamos",
  description: "Simula tu préstamo personal y descubre el costo real (TCEA) antes de solicitarlo con un banco.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
