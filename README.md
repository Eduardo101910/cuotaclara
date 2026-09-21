# Motor de cálculo — CuotaClara (V1: préstamos personales)

Este módulo es el **paso 1 del roadmap**: el motor de cálculo financiero, aislado de la base de datos y del frontend. Antes de construir cualquier pantalla, necesitamos estar 100% seguros de que los números son correctos.

No depende de Supabase ni de Next.js — es TypeScript puro, así que se puede probar solo y luego importarlo directo en el proyecto Next.js más adelante (`import { simular } from "./engine"`).

## ¿Qué calcula?

Dado un préstamo personal con sistema de amortización **francés** (cuota fija — el que usan casi todos los bancos peruanos para créditos de consumo), calcula:

- La cuota mensual base
- El **cronograma completo** (tabla de amortización mes a mes)
- El total de intereses, comisiones y seguros pagados en todo el préstamo
- La **TCEA** (Tasa de Costo Efectivo Anual) — el número que de verdad le importa al usuario, porque incluye TODOS los cargos, no solo el interés

## Estructura de archivos

```
engine/
├── src/
│   ├── tipos.ts            → Interfaces (qué entra y qué sale del motor)
│   ├── tasas.ts             → Conversión de tasas (TEA ↔ TEM, TNA → TEM)
│   ├── cronograma.ts        → Sistema francés + generación de la tabla de amortización
│   ├── tcea.ts               → Cálculo de la TCEA (resolviendo la tasa interna de retorno)
│   ├── capacidadPago.ts       → OPCIONAL: % cuota/ingreso y alerta de riesgo
│   ├── comparadorPlazos.ts    → OPCIONAL: tabla comparativa entre varios plazos
│   ├── pagoAnticipado.ts       → OPCIONAL: simula abonos extraordinarios
│   ├── motor.ts                → Función simular() (el núcleo, siempre se ejecuta)
│   ├── index.ts                 → Barrel: re-exporta todo lo anterior
│   └── ejemplo.ts                → Casos de prueba con datos reales
├── package.json
├── tsconfig.json
└── README.md                      → este archivo
```

## Cómo probarlo

```bash
cd engine
npm install
npm run ejemplo
```

Esto compila el TypeScript y corre `ejemplo.ts`, que simula un préstamo de S/ 10,000 a 12 meses con TEA 45%, e imprime en consola la TEM, la TCEA y la tabla de amortización completa, mes por mes.

## Explicación de cada fórmula

### 1. TEA → TEM (`tasas.ts`)

Los bancos publican la tasa en anual (TEA), pero las cuotas son mensuales. Hay que convertir:

```
TEM = (1 + TEA) ^ (1/12) − 1
```

Ejemplo: TEA 45% → TEM ≈ 3.1448% mensual. **No es 45/12**, ese es un error común — la tasa efectiva se compone, no se divide.

### 2. Cuota fija — sistema francés (`cronograma.ts`)

```
Cuota = Monto × TEM / (1 − (1 + TEM) ^ −n)
```

Donde `n` es el número de cuotas. Esta fórmula da la cuota "pura" (sin comisión ni seguro). Es constante durante todo el préstamo; lo que cambia mes a mes es cuánto de esa cuota es interés y cuánto es amortización de capital (al inicio es casi todo interés, al final casi todo capital).

### 3. Cronograma completo (`cronograma.ts`)

Para cada mes se calcula:

1. `interés = saldo_actual × TEM`
2. `amortización = cuota_base − interés`
3. `seguro de desgravamen = saldo_actual × %seguro` (se recalcula cada mes porque el saldo baja)
4. `cuota total = cuota_base + seguro + comisión + portes`
5. `saldo_nuevo = saldo_actual − amortización`

En la **última cuota** se ajusta la amortización para que el saldo cierre exactamente en 0 (si no, quedan centavos flotando por acumulación de redondeo).

### 4. TCEA — Tasa de Costo Efectivo Anual (`tcea.ts`)

Esta es la fórmula más importante del proyecto, porque es la que "no deja engañar" al usuario. La TEA solo mide el interés; la TCEA mide **todo lo que realmente sale del bolsillo** (interés + comisiones + seguros) expresado como una tasa anual comparable.

Se calcula así:

1. Se arma un flujo de caja: en el mes 0 el cliente recibe el monto del préstamo (flujo positivo); cada mes siguiente paga la cuota total con todos los cargos (flujo negativo).
2. Se busca, por **bisección**, la tasa mensual que hace que el Valor Actual Neto (VAN) de ese flujo sea exactamente 0. Esa tasa es la "TIR" (tasa interna de retorno) del préstamo.
3. Esa tasa mensual se anualiza: `TCEA = (1 + TIR_mensual) ^ 12 − 1`.

En el ejemplo (`ejemplo.ts`): TEA = 45%, pero **TCEA = 47.26%** — la diferencia (2.26 puntos) es exactamente el costo real de la comisión de S/ 5 y el seguro de desgravamen que el banco no resalta cuando publicita "45% anual".

> Nota técnica: se usa bisección en vez de Newton-Raphson porque es más simple de mantener, no requiere derivadas, y para este rango de tasas converge en menos de 60 iteraciones con precisión de 8 decimales — de sobra para uso financiero.

## Funciones opcionales ("casillas" del formulario)

Estas 4 cosas están en el motor, pero **no se activan solas**: cada una corresponde a una casilla que el usuario marca en el formulario. Si no la marca, esa parte del cálculo simplemente no se ejecuta y el resultado normal no cambia en nada.

### 1. Comisión de desembolso (`comisionDesembolso`)

Campo opcional dentro de `SimulacionInput`. Si el usuario marca "¿tiene comisión de desembolso?" e ingresa un monto, ese monto se resta del monto neto que realmente recibe, y la TCEA se recalcula sobre ese monto neto (siempre sube, porque recibe menos de lo que paga). Si no la marca, `comisionDesembolso` queda `undefined` y el cálculo es idéntico al caso base.

En el ejemplo: con S/ 150 de comisión de desembolso, la TCEA sube de 47.26% a **51.70%**.

### 2. Capacidad de pago (`ingresoMensual` → `capacidadPago`)

Si el usuario marca "calcular mi capacidad de pago" e ingresa su ingreso mensual, el resultado trae un bloque `capacidadPago` con el % que representa la cuota sobre su ingreso y una alerta si supera 30% (umbral configurable en `capacidadPago.ts`). Si no marca la casilla, `ingresoMensual` no se envía y `resultado.capacidadPago` simplemente es `undefined` — no aparece en la respuesta.

### 3. Comparador de plazos (`compararPlazos()`)

Función aparte, no forma parte de `simular()`. Solo se llama si el usuario pulsa "comparar plazos" y elige, por ejemplo, `[12, 24, 36]`. Devuelve una fila por plazo con cuota, total pagado, intereses y TCEA — exactamente la tabla que pediste de ejemplo.

### 4. Pago anticipado (`calcularPagoAnticipado()`)

Función aparte también. Solo aplica sobre un préstamo que el usuario ya tiene activo (con su cronograma ya generado), cuando marca "simular pago anticipado" en una cuota específica. Soporta las dos modalidades reales que ofrecen los bancos:

- `"reducir_cuota"` — mantiene el mismo plazo, baja la cuota mensual
- `"reducir_plazo"` — mantiene la misma cuota, termina de pagar antes

En el ejemplo (abono de S/ 2,000 en la cuota 6 de 12): reducir plazo ahorra S/ 340.34 en intereses, reducir cuota ahorra S/ 225.81 — reducir plazo siempre ahorra más, porque la deuda se cancela más rápido.

## Parámetros de entrada (`SimulacionInput`)

| Campo | Tipo | Ejemplo | Notas |
|---|---|---|---|
| `monto` | number | `10000` | Monto solicitado en soles |
| `plazoMeses` | number | `12` | Número de cuotas |
| `tea` | number | `0.45` | Como decimal, no como `45` |
| `comisionMensual` | number | `5` | S/ fijos por mes, `0` si no aplica |
| `seguroDesgravamenPorc` | number | `0.0005` | % mensual sobre saldo, como decimal |
| `portesMensual` | number | `0` | S/ fijos por mes, `0` si no aplica |
| `fechaInicio` | Date (opcional) | `new Date("2026-10-01")` | Si no se pasa, el cronograma no trae fechas |
| `comisionDesembolso` | number (opcional) | `150` | Solo si el usuario marca la casilla correspondiente |
| `ingresoMensual` | number (opcional) | `1500` | Solo si el usuario marca "calcular mi capacidad de pago" |

## Qué falta antes de integrarlo a producción

- [ ] Reemplazar `number` por una librería de precisión decimal (ej. `decimal.js`) si se detectan errores de redondeo acumulado en préstamos muy largos (>36 meses)
- [ ] Agregar validaciones de entrada (monto > 0, plazo entre 1 y 60 meses, tasas dentro de rangos razonables) antes de exponerlo en un formulario público
- [ ] Escribir pruebas unitarias (ej. con `vitest` o `jest`) comparando contra cronogramas de bancos reales para verificar exactitud
- [ ] Agregar un link de referencia a la [página de comparación de costos de la SBS](https://www.sbs.gob.pe) en la pantalla de resultados (esto es solo un enlace informativo, no algo que el motor calcule)

## Siguiente paso del roadmap

Con este motor validado, el **paso 2** es crear las tablas en Supabase (`loan_simulations`, `loan_active`, `payments`, `notifications_log`, ya definidas en el documento de planificación) y conectar este motor a un endpoint o función que guarde el resultado de `simular()` cuando el usuario decide iniciar seguimiento.
