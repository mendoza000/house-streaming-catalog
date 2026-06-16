# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Convenciones de código, nomenclatura, estructura de carpetas y modelo de dominio están documentados en `AGENTS.md`. Leelo primero. Este archivo cubre lo que NO es obvio leyendo el código.

## Comandos

```bash
bun dev              # Servidor de desarrollo (Next.js)
bun run build        # Build de producción
bun run lint         # Biome check (NO eslint)
bun run format       # Biome format --write

# Regenerar tipos de Supabase tras cambios de schema
supabase gen types typescript --project-id [ID] --schema public > src/types/supabase.ts
```

- **Package manager**: `bun` (hay `bun.lockb`). El `package-lock.json` presente es residual.
- **Linter/formatter**: Biome, no ESLint/Prettier. La config controla el orden de imports.
- No hay suite de tests configurada.

## Arquitectura

**Stack**: Next.js 16 (App Router) + React 19 (React Compiler activo) + Tailwind v4 + Supabase + Zustand + React Query. Path alias: `@/*` → `src/*`.

### Flujo de datos: capas separadas

```
componente → hook (React Query) → función api/ → cliente Supabase
```

- `src/api/*.ts` — funciones puras de acceso a datos. **Nunca** se llaman directo desde componentes; siempre vía hooks.
- `src/hooks/<dominio>/use-*.ts` — wrappers de React Query (`useQuery`/`useMutation`) sobre las funciones de `api/`.
- El cliente Supabase (`src/lib/supabase/client.ts`) es **anon-key del lado del cliente**. Las mutaciones dependen de RLS.

### Patrón obligatorio: result-tuple, sin throws

Toda función de `src/api/` retorna `{ data, error }` y atrapa internamente. **No lanzan excepciones.** Replicá este patrón al agregar funciones de API:

```typescript
async function foo(): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.from("...")...
    if (error) return { data: null, error: new Error(error.message) }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("...") }
  }
}
```

### Órdenes draft + cart hash (lógica de negocio crítica)

El checkout NO crea una orden nueva por intento. `createOrUpdateDraftOrder` (`src/api/orders.ts`):

1. Genera un `cartHash` determinístico del carrito (`src/utils/cart-hash.ts`).
2. Busca un draft existente por `client_email + cart_hash + status='draft'`.
3. Si existe → lo actualiza; si no → inserta uno nuevo.

Esto evita órdenes duplicadas cuando el usuario vuelve al checkout con el mismo carrito. **Si tocás el contenido de `CartItem`, actualizá `generateCartHash` en consecuencia** (el hash se arma de `id-accounts-months-quantity`).

**Gotcha RLS**: un `UPDATE` puede ser bloqueado silenciosamente por RLS y devolver `null` sin error. El código lo maneja devolviendo el draft original como fallback (ver `orders.ts:87`). Hay un `FIX-RLS-UPDATE-DRAFTS.sql` en la raíz relacionado a esto — las políticas de RLS de `orders` viven en `supabase/`.

### Estado del carrito (Zustand, persistido)

`src/stores/cart-store.ts`, persistido en `localStorage` bajo `cart-storage`.

- **Identidad de item compuesta**: un item se considera "el mismo" solo si coinciden `id + accounts + months`. El mismo servicio con distinta cantidad de cuentas/meses son líneas separadas del carrito.
- **Fórmula de precio** (única fuente de verdad): `price * accounts * months * quantity`.
- Usá selectores específicos: `useCartStore(s => s.items)`, no el store entero.

### Pagos

Tres métodos, dos modos:

- **PayPal**: server routes en `src/app/api/paypal/{create-order,capture-order}/route.ts` (el secret vive en el server).
- **Binance Pay**: QR automático.
- **Pago Móvil**: manual — el cliente sube comprobante (`src/api/receipts.ts` → tabla `receipts`), queda en estado `validating` para revisión manual.

Estados de orden: `draft → pending → validating → completed | failed | cancelled` (ver `AGENTS.md`).

## Variables de entorno

`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son **requeridas** — el cliente lanza al iniciar si faltan. Credenciales de PayPal van del lado server para las API routes.
