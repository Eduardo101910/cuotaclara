# CuotaClara — Web (paso 3 del roadmap)

Landing + formulario de simulación en Next.js 14 (App Router) + Tailwind, conectado al motor de cálculo ya probado (`lib/motor/`).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — verás la landing con el botón "Simular ahora". Te lleva a `/simular`, donde llenas el formulario y ves el resultado (cuota, TCEA, cronograma completo) al instante, sin necesidad de cuenta ni backend — el cálculo se hace en el navegador con `lib/motor/simular()`.

## Qué incluye

- `app/page.tsx` — landing (pantalla de bienvenida del flujo definido en el documento de planificación)
- `app/simular/page.tsx` — formulario + resultados
- `components/FormularioSimulacion.tsx` — formulario con las casillas opcionales (comisión de desembolso, capacidad de pago)
- `components/ResultadoSimulacion.tsx` — cuota, TCEA, cronograma completo, alerta de capacidad de pago
- `lib/motor/` — el mismo motor de cálculo del paso 1 (TCEA, sistema francés, pago anticipado, comparador de plazos), sin cambios

## Qué falta (siguiente paso del roadmap)

El botón "Iniciar seguimiento de este préstamo" en `/simular` todavía no hace nada — ahí se conecta:

1. Supabase Auth (registro/login)
2. Al confirmar sesión, guardar la simulación en `loan_simulations` y crear el registro en `loan_active` con el cronograma en `payments`
3. Dashboard de préstamos activos

Ese es el **paso 4**: integrar Supabase Auth + guardar en las tablas ya creadas.
