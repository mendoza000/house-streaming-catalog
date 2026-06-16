# AGENTS.md - House Streaming Catalog

## Visión General

E-commerce para venta de cuentas de streaming (Netflix, Disney+, etc.) con:
- **Frontend**: Next.js 16 + React 19 + Tailwind v4
- **Backend**: Supabase (PostgreSQL)
- **Estado**: Zustand (persistido en localStorage)
- **Datos**: React Query (TanStack Query)
- **UI**: shadcn/ui
- **Pagos**: PayPal, Binance Pay, Pago Móvil

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (PayPal)
│   ├── checkout/          # Página de checkout
│   └── ...
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── checkout/          # Flujo de checkout
│   ├── home/products/     # Catálogo de productos
│   └── navbar/            # Navegación + carrito
├── hooks/                 # React Query hooks
│   ├── services/
│   ├── orders/
│   └── ...
├── api/                   # Funciones de API (Supabase)
├── stores/                # Zustand stores
├── types/                 # TypeScript types
├── constants/             # Constantes del proyecto
└── lib/                   # Configuraciones
```

## Convenciones de Código

### Nomenclatura
- **Archivos**: `kebab-case.tsx` (ej: `payment-methods-section.tsx`)
- **Componentes**: `PascalCase` (ej: `PaymentMethodsSection`)
- **Hooks**: `use-descriptivo.ts` (ej: `use-services.ts`)
- **Stores**: `nombre-store.ts` (ej: `cart-store.ts`)
- **Funciones**: `camelCase` (ej: `formatPrice`, `createOrder`)
- **Interfaces**: `PascalCase` (ej: `CartItem`, `ClientFormData`)
- **Types**: `PascalCase` (ej: `Currency`, `OrderStatus`)

### Idioma
- **Variables/funciones**: Inglés
- **UI/Labels**: Español
- **Comentarios**: Español

### Imports (ordenado por Biome)
1. React/Next
2. Librerías de terceros
3. Componentes UI (`@/components/ui/*`)
4. Componentes de feature
5. Hooks (`@/hooks/*`)
6. API/Utils/Types

## Patrones de Estado (Zustand)

### Cart Store
```typescript
// Carrito con persistencia local
const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => { /* merge logic */ },
      getTotalPrice: () => { /* derived */ },
    }),
    { name: "cart-storage" }
  )
)
```

### Currency Store
```typescript
// USD | VES con persistencia
const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({ currency: "USD", setCurrency: (c) => set({ currency: c }) }),
    { name: "currency-storage" }
  )
)
```

## Patrones de Datos (React Query)

### Query Keys
```typescript
const servicesKeys = {
  all: ["services"] as const,
  detail: (id: number) => ["services", id] as const,
}

export function useServices() {
  return useQuery({
    queryKey: servicesKeys.all,
    queryFn: getServices,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
```

## Modelo de Datos del Dominio

### CartItem (Específico de Streaming)
```typescript
interface CartItem {
  id: string           // ID del servicio
  title: string        // Nombre (Netflix, Disney+)
  price: number        // Precio base por mes por cuenta
  quantity: number     // Cantidad de grupos
  accounts: number     // Número de cuentas (ej: 2)
  months: number       // Meses (1, 2, 3, 6)
  image?: string
}

// Cálculo: price * accounts * months * quantity
```

### Estados de Orden
- `draft` - Orden creada, esperando pago
- `pending` - Cliente inició pago
- `validating` - Pago manual enviado, esperando validación
- `completed` - Pago confirmado
- `failed` - Pago fallido
- `cancelled` - Orden cancelada

## Flujo de Checkout (3 Pasos)

1. **Revisión**: Revisar carrito, ingresar datos cliente, crear orden draft
2. **Pago**: Según método seleccionado:
   - PayPal (automático)
   - Binance Pay (QR automático)
   - Pago Móvil (manual + upload comprobante)
3. **Confirmación**: Mostrar estado y próximos pasos

## Comandos Útiles

```bash
# Desarrollo
bun dev              # Iniciar servidor dev

# Lint/Format
bun run lint         # Biome check
bun run format       # Biome format --write

# Generar tipos Supabase
supabase gen types typescript --project-id [ID] --schema public > src/types/supabase.ts
```

## Reglas Importantes

1. **Nunca** commitear archivos `.env` o credenciales
2. Usar `cn()` helper para clases Tailwind condicionales
3. Siempre tipar retornos de funciones API
4. Usar selectores específicos en Zustand: `useCartStore(s => s.items)`
5. Mantener `staleTime` de 5 min para queries
6. Para métodos de pago manuales, generar `cartHash` para evitar duplicados

## Configuración Tailwind v4

- Variables CSS en `globals.css` usando formato OKLCH
- `@theme inline` para mapear variables
- Dark mode automático vía `next-themes`

## Supabase

- Tipos auto-generados en `src/types/supabase.ts`
- Cliente en `src/lib/supabase/client.ts`
- Tablas principales: `services`, `orders`, `order_items`, `receipts`
