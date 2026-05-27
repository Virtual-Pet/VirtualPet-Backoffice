# Cambios pendientes — VirtualPet-Backoffice

**Rama:** `fix/order-table-display`
**Fecha:** 27/05/2026

---

## 1. src/components/orders/OrderTable.tsx

- Se modificó el formato de la columna **Fecha** para mostrar día y hora usando `toLocaleString` en lugar de solo la fecha (`toLocaleDateString`).
- Se cambió el texto del botón de acción en estado `CONFIRMED` de "Confirmar" a **"Marcar como Preparado"**, reflejando correctamente la transición logística `CONFIRMED → PREPARED`.

## 2. src/context/authContext.tsx

- Se adaptaron los tipos y métodos del contexto de autenticación para que coincidan con la estructura de roles y permisos devuelta por el backend.
- Se eliminó el casteo `as any` en la respuesta de login, usando el tipo correcto.

## 3. src/lib/auth.types.ts

- Se actualizaron los tipos de TypeScript del módulo de autenticación para reflejar la estructura real de la respuesta del servidor.

## 4. src/lib/services/auth.service.ts

- Se ajustó el servicio de autenticación para consumir correctamente los endpoints del backend.

## 5. src/lib/services/employees.service.ts

- Se corrigió el servicio de empleados para alinearlo con la API del backend.

---

> Todos los cambios son compatibles con el deploy a AWS.
